import { HttpErrorResponse } from '@angular/common/http';

// The backend answers errors as { code: 'INSUFFICIENT_STOCK', ...details }. Views translate the code.
export interface ApiErrorBody {
  code?: string;
  [detail: string]: unknown;
}

export function apiError(e: unknown): ApiErrorBody {
  if (e instanceof HttpErrorResponse && e.error && typeof e.error === 'object') return e.error as ApiErrorBody;
  return { code: e instanceof HttpErrorResponse && e.status === 0 ? 'NETWORK' : 'UNKNOWN' };
}

export const apiCode = (e: unknown): string => apiError(e).code ?? 'UNKNOWN';
