// Generic error reporting stub — no external service dependency.
export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof console !== "undefined") {
    console.error("[error]", error, context);
  }
}
