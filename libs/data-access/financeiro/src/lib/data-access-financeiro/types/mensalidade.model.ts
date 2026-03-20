export type MensalidadeStatus = 'pendente' | 'pago';

/**
 * Cobrança mensal por aluno (uma linha por competência).
 * Adequado para agregações e relatórios por `referenciaMes`, `status` e somas de `valor`.
 */
export interface Mensalidade {
  id: string;
  alunoId: string;
  /** Primeiro dia do mês de competência (ISO date yyyy-MM-dd). */
  referenciaMes: string;
  valor: number;
  status: MensalidadeStatus;
  /** Data de vencimento (ISO date yyyy-MM-dd). */
  dataVencimento: string;
  pagoEm: string | null;
  observacoes: string;
}

export interface MensalidadeComAluno extends Mensalidade {
  alunoNome: string;
  alunoTelefone: string;
}

export interface NovaMensalidade {
  alunoId: string;
  referenciaMes: string;
  valor: number;
  status: MensalidadeStatus;
  dataVencimento: string;
  observacoes?: string;
}
