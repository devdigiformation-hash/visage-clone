// Small, opinionated error-handling helpers used across the app.
// Purpose: avoid silent failures, keep user-visible feedback consistent,
// and always preserve the original Error for Server Logs / Lovable capture.

import { toast } from "sonner";
import { reportLovableError } from "./lovable-error-reporting";

export type SafeResult<T> = { ok: true; value: T } | { ok: false; error: Error };

/** Parse JSON without throwing; returns a SafeResult. */
export function safeJsonParse<T = unknown>(input: string): SafeResult<T> {
  try {
    return { ok: true, value: JSON.parse(input) as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

/** Run a sync function, returning a SafeResult instead of throwing. */
export function trySync<T>(fn: () => T): SafeResult<T> {
  try { return { ok: true, value: fn() }; }
  catch (e) { return { ok: false, error: e instanceof Error ? e : new Error(String(e)) }; }
}

/** Run an async function, returning a SafeResult instead of throwing. */
export async function tryAsync<T>(fn: () => Promise<T>): Promise<SafeResult<T>> {
  try { return { ok: true, value: await fn() }; }
  catch (e) { return { ok: false, error: e instanceof Error ? e : new Error(String(e)) }; }
}

type ReportOpts = { context?: string; silent?: boolean; extra?: Record<string, unknown> };

/** Surface an error to the user (toast), the console, and Lovable capture. */
export function reportError(message: string, err: unknown, opts: ReportOpts = {}) {
  const error = err instanceof Error ? err : new Error(String(err));
  // Preserve original Error for Server Logs — do NOT log error.message alone.
  // eslint-disable-next-line no-console
  console.error(`[${opts.context ?? "app"}] ${message}`, error);
  try { reportLovableError(error, { boundary: opts.context ?? "app", ...opts.extra }); } catch {}
  if (!opts.silent && typeof window !== "undefined") {
    try { toast.error(message, { description: error.message }); } catch {}
  }
}

/** Notify the user of success. Safe on SSR. */
export function reportSuccess(message: string, description?: string) {
  if (typeof window === "undefined") return;
  try { toast.success(message, description ? { description } : undefined); } catch {}
}
