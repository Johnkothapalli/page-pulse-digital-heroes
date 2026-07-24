export class AuditFailure extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
    public readonly hint?: string,
  ) {
    super(message);
    this.name = "AuditFailure";
  }
}
