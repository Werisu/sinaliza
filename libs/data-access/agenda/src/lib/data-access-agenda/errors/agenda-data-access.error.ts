import { PostgrestError } from '@supabase/supabase-js';

export class AgendaDataAccessError extends Error {
  override readonly name = 'AgendaDataAccessError';

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

export function mapPostgrestError(error: PostgrestError): AgendaDataAccessError {
  return new AgendaDataAccessError(
    error.message || 'Erro ao comunicar com o servidor.',
    error.code,
    error.details ?? undefined,
    error as unknown
  );
}
