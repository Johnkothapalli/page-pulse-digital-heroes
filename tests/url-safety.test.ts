import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AuditFailure } from "@/lib/audit-failure";
import { isUnsafeIpAddress, parseAuditUrl } from "@/lib/url-safety";

describe("parseAuditUrl", () => {
  it("accepts a complete public HTTPS URL", () => {
    assert.equal(
      parseAuditUrl("https://example.com/docs?q=pulse").toString(),
      "https://example.com/docs?q=pulse",
    );
  });

  it("rejects malformed and unsupported URLs", () => {
    assert.throws(() => parseAuditUrl("not a url"), AuditFailure);
    assert.throws(() => parseAuditUrl("file:///etc/passwd"), AuditFailure);
  });

  it("rejects credentials and local hostnames", () => {
    assert.throws(
      () => parseAuditUrl("https://user:secret@example.com"),
      AuditFailure,
    );
    assert.throws(() => parseAuditUrl("http://localhost:3000"), AuditFailure);
    assert.throws(() => parseAuditUrl("http://printer.local"), AuditFailure);
  });
});

describe("isUnsafeIpAddress", () => {
  it("blocks private, loopback, link-local, and reserved addresses", () => {
    [
      "10.0.0.1",
      "127.0.0.1",
      "169.254.1.4",
      "172.16.0.5",
      "192.168.1.1",
      "192.0.2.1",
      "::1",
      "fd00::1",
      "fe80::1",
    ].forEach((address) => assert.equal(isUnsafeIpAddress(address), true));
  });

  it("allows ordinary public IP addresses", () => {
    assert.equal(isUnsafeIpAddress("1.1.1.1"), false);
    assert.equal(isUnsafeIpAddress("2606:4700:4700::1111"), false);
  });
});
