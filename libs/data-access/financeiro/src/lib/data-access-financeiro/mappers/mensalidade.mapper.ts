import {
  Mensalidade,
  MensalidadeComAluno,
  MensalidadeStatus,
  NovaMensalidade,
} from '../types/mensalidade.model';
import { MensalidadeRow } from '../types/mensalidade-row.model';

function parseMoney(v: number | string): number {
  if (typeof v === 'number') return v;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function isoDateOnly(d: string): string {
  return d.length >= 10 ? d.slice(0, 10) : d;
}

export function mensalidadeRowToDomain(row: MensalidadeRow): Mensalidade {
  return {
    id: row.id,
    alunoId: row.aluno_id,
    referenciaMes: isoDateOnly(row.referencia_mes),
    valor: parseMoney(row.valor),
    status: row.status,
    dataVencimento: isoDateOnly(row.data_vencimento),
    pagoEm: row.pago_em,
    observacoes: row.observacoes ?? '',
  };
}

export function mensalidadeRowToComAluno(row: MensalidadeRow): MensalidadeComAluno {
  const base = mensalidadeRowToDomain(row);
  return {
    ...base,
    alunoNome: row.alunos?.nome ?? '(Aluno)',
    alunoTelefone: row.alunos?.telefone ?? '',
  };
}

export function novaMensalidadeToInsertPayload(n: NovaMensalidade): Record<string, unknown> {
  const pagoEm = n.status === 'pago' ? new Date().toISOString() : null;
  return {
    aluno_id: n.alunoId,
    referencia_mes: n.referenciaMes,
    valor: n.valor,
    status: n.status,
    data_vencimento: n.dataVencimento,
    pago_em: pagoEm,
    observacoes: n.observacoes ?? '',
  };
}

export function mensalidadeUpdatePayload(dados: {
  valor?: number;
  status?: MensalidadeStatus;
  dataVencimento?: string;
  observacoes?: string;
  pagoEm?: string | null;
}): Record<string, unknown> {
  const out: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (dados.valor !== undefined) out['valor'] = dados.valor;
  if (dados.status !== undefined) out['status'] = dados.status;
  if (dados.dataVencimento !== undefined) out['data_vencimento'] = dados.dataVencimento;
  if (dados.observacoes !== undefined) out['observacoes'] = dados.observacoes;
  if (dados.pagoEm !== undefined) out['pago_em'] = dados.pagoEm;
  return out;
}
