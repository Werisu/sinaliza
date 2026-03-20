import { PostgrestError } from '@supabase/supabase-js';

/**
 * Erro tipado da camada de dados de alunos.
 * Evita vazar detalhes do PostgREST para a UI; a feature pode exibir `message`.
 */
export class AlunosDataAccessError extends Error {
  override readonly name = 'AlunosDataAccessError';

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

export function mapPostgrestError(error: PostgrestError): AlunosDataAccessError {
  return new AlunosDataAccessError(
    humanizePostgrestMessage(error),
    error.code,
    error.details ?? undefined,
    error as unknown
  );
}

function humanizePostgrestMessage(error: PostgrestError): string {
  if (error.message) {
    return error.message;
  }
  return 'Erro ao comunicar com o servidor.';
}
