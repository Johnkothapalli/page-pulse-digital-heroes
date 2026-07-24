import { load } from "cheerio";
import type { AuditReport } from "@/lib/types";

interface ParseContext {
  url: string;
  httpStatus: number;
  responseTimeMs: number;
  auditedAt?: string;
}

function cleanInlineText(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned || null;
}

export function countWords(text: string): number {
  const words = text.match(
    /[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu,
  );
  return words?.length ?? 0;
}

export function parsePage(html: string, context: ParseContext): AuditReport {
  const $ = load(html);

  const title = cleanInlineText($("title").first().text());
  const descriptionElement = $("meta")
    .filter((_, element) => {
      return ($(element).attr("name") ?? "").toLowerCase() === "description";
    })
    .first();
  const metaDescription = cleanInlineText(descriptionElement.attr("content"));

  const images = $("img");
  const imagesMissingAlt = images
    .toArray()
    .filter((image) => {
      const alt = $(image).attr("alt");
      return alt === undefined || alt.trim() === "";
    }).length;

  const readableRoot = ($("body").length ? $("body") : $("html")).clone();
  readableRoot
    .find("script, style, noscript, svg, template, iframe")
    .remove();
  const readableText = readableRoot.text().replace(/\s+/g, " ").trim();

  return {
    url: context.url,
    httpStatus: context.httpStatus,
    responseTimeMs: Math.max(0, Math.round(context.responseTimeMs)),
    title,
    metaDescription,
    h1Count: $("h1").length,
    imageCount: images.length,
    imagesMissingAlt,
    wordCount: countWords(readableText),
    auditedAt: context.auditedAt ?? new Date().toISOString(),
  };
}
