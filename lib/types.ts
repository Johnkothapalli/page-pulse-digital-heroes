export interface AuditReport {
  url: string;
  httpStatus: number;
  responseTimeMs: number;
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  imageCount: number;
  imagesMissingAlt: number;
  wordCount: number;
  auditedAt: string;
}

export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
    hint?: string;
  };
}
