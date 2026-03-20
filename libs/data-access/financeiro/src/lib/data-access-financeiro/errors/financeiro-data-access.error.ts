import { PostgrestError } from '@supabase/supabase-js';

export class FinanceiroDataAccessError extends Error {
  override readonly name = 'FinanceiroDataAccessError';

  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: string,
    readonly originalCause?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function mapPostgrestError(error: PostgrestError): FinanceiroDataAccessError {
  return new FinanceiroDataAccessError(
    error.message || 'Erro ao comunicar com o servidor.',
    error.code,
    error.details ?? undefined,
    error as unknown
  );
}
