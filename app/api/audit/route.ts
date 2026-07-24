import { NextResponse } from "next/server";

import { AuditFailure } from "@/lib/audit-failure";
import { fetchHtmlPage } from "@/lib/fetch-page";
import { parsePage } from "@/lib/parser";
import type { ApiErrorPayload } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(
  status: number,
  code: string,
  message: string,
  hint?: string,
) {
  const payload: ApiErrorPayload = {
    error: {
      code,
      message,
      ...(hint ? { hint } : {}),
    },
  };

  return NextResponse.json(payload, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      400,
      "INVALID_JSON",
      "The request body must be valid JSON.",
    );
  }

  const url =
    typeof body === "object" && body !== null && "url" in body
      ? (body as { url: unknown }).url
      : undefined;

  try {
    const fetched = await fetchHtmlPage(url);
    const report = parsePage(fetched.html, {
      url: fetched.url,
      httpStatus: fetched.httpStatus,
      responseTimeMs: fetched.responseTimeMs,
    });

    return NextResponse.json(report, {
      status: 200,
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    if (error instanceof AuditFailure) {
      return errorResponse(
        error.status,
        error.code,
        error.message,
        error.hint,
      );
    }

    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Page Pulse hit an unexpected error.",
      "Try again in a moment.",
    );
  }
}

export function GET() {
  return NextResponse.json(
    {
      name: "Page Pulse audit API",
      method: "POST",
      body: { url: "https://example.com" },
    },
    { headers: { "cache-control": "no-store" } },
  );
}
