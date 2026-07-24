import { isIP } from "node:net";

import { AuditFailure } from "@/lib/audit-failure";

const BLOCKED_HOST_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".home",
  ".lan",
];

export function parseAuditUrl(input: unknown): URL {
  if (typeof input !== "string" || !input.trim()) {
    throw new AuditFailure(
      "INVALID_URL",
      400,
      "Enter a complete URL to audit.",
      "Include http:// or https:// at the beginning.",
    );
  }

  const candidate = input.trim();
  if (candidate.length > 2_048) {
    throw new AuditFailure(
      "INVALID_URL",
      400,
      "That URL is too long to audit safely.",
    );
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new AuditFailure(
      "INVALID_URL",
      400,
      "That does not look like a valid URL.",
      "Try a full address such as https://example.com.",
    );
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new AuditFailure(
      "UNSUPPORTED_PROTOCOL",
      400,
      "Only HTTP and HTTPS pages can be audited.",
    );
  }

  if (url.username || url.password) {
    throw new AuditFailure(
      "INVALID_URL",
      400,
      "URLs containing usernames or passwords are not accepted.",
    );
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    hostname === "localhost" ||
    BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
  ) {
    throw new AuditFailure(
      "PRIVATE_TARGET",
      403,
      "Private and local network addresses cannot be audited.",
    );
  }

  return url;
}

export function isUnsafeIpAddress(address: string): boolean {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, "");
  const version = isIP(normalized);

  if (version === 4) {
    const octets = normalized.split(".").map(Number);
    const [a, b] = octets;

    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 0) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 2) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 198 && b === 51) ||
      (a === 203 && b === 0) ||
      a >= 224
    );
  }

  if (version === 6) {
    return (
      normalized === "::" ||
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      /^fe[89ab]/.test(normalized) ||
      normalized.startsWith("ff") ||
      normalized.startsWith("2001:db8") ||
      normalized.startsWith("::ffff:")
    );
  }

  return true;
}

export async function validatePublicTarget(input: unknown): Promise<URL> {
  const url = parseAuditUrl(input);
  const hostname = url.hostname.replace(/^\[|\]$/g, "");

  if (isIP(hostname) && isUnsafeIpAddress(hostname)) {
    throw new AuditFailure(
      "PRIVATE_TARGET",
      403,
      "Private and reserved network addresses cannot be audited.",
    );
  }

  return url;
}
