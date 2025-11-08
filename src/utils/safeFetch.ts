/**
 * Unified safe fetch helper for admin/client requests.
 * Handles JSON parsing guard, HTML/redirect responses, and unauthorized logic.
 */
export interface SafeFetchOptions extends RequestInit {
  onUnauthorized?: () => void;
  /** Optional custom message when non-json received */
  nonJsonMessage?: string;
}

export interface SafeFetchResult<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: unknown;
  raw?: string; // snippet of raw response if non-json
  status: number;
}

export async function safeFetch<T = unknown>(url: string, opts: SafeFetchOptions = {}): Promise<SafeFetchResult<T>> {
  const { onUnauthorized, nonJsonMessage, ...fetchOpts } = opts;
  const response = await fetch(url, { redirect: 'manual', ...fetchOpts });
  const status = response.status;

  if (status === 401 || status === 403) {
    if (typeof onUnauthorized === 'function') {
      onUnauthorized();
    }
    return { success: false, status, message: 'Unauthorized' };
  }

  const contentType = response.headers.get('content-type') || '';
  let json: unknown = null;

  if (contentType.includes('application/json')) {
    try {
      json = await response.json();
    } catch (e) {
      return { success: false, status, message: 'Gagal parse JSON', raw: String(e) };
    }
    if (!response.ok) {
      const j = json as Record<string, unknown>;
      const message = typeof j.message === 'string' ? j.message : 'Request gagal';
      return { success: false, status, message, data: j.data as T, pagination: j.pagination };
    }
    if (json && typeof json === 'object') {
      const j = json as Record<string, unknown>;
      const message = typeof j.message === 'string' ? j.message : undefined;
      const data = (j.data ?? j.product) as T;
      return { success: Boolean(j.success), status, message, data, pagination: j.pagination };
    }
    return { success: false, status, message: 'Struktur JSON tidak valid', raw: JSON.stringify(json).slice(0,200) };
  }

  // Non JSON response (likely HTML or text)
  const text = await response.text();
  const snippet = text.slice(0, 200);
  // Heuristics for HTML
  if (/<!DOCTYPE html>|<html/i.test(snippet)) {
    return { success: false, status, message: nonJsonMessage || 'Server mengirim HTML tak terduga', raw: snippet };
  }
  return { success: false, status, message: nonJsonMessage || 'Format respon tidak dikenal', raw: snippet };
}

/** Convenience wrapper that throws on failure for imperative flows */
export async function safeFetchOrThrow<T = unknown>(url: string, opts: SafeFetchOptions = {}): Promise<SafeFetchResult<T>> {
  const result = await safeFetch<T>(url, opts);
  if (!result.success) {
    const err = new Error(result.message || 'Request failed');
    (err as unknown as { status?: number }).status = result.status;
    (err as unknown as { raw?: string }).raw = result.raw;
    throw err;
  }
  return result;
}
