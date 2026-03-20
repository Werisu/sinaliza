import { MensalidadeStatus } from './mensalidade.model';

export interface MensalidadeRow {
  id: string;
  aluno_id: string;
  referencia_mes: string;
  valor: number | string;
  status: MensalidadeStatus;
  data_vencimento: string;
  pago_em: string | null;
  observacoes: string;
  created_at?: string;
  updated_at?: string;
  alunos?: { nome: string; telefone: string } | null;
}
