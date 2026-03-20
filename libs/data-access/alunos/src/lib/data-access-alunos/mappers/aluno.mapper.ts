import { Aluno } from '../types/aluno.model';
import { AlunoRow } from '../types/aluno-row.model';

function parseNumeric(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

export function alunoRowToDomain(row: AlunoRow): Aluno {
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    tipoAula: row.tipo_aula,
    nivel: row.nivel,
    observacoes: row.observacoes ?? '',
    valorMensal: parseNumeric(row.valor_mensal),
  };
}

export function alunoToInsertPayload(
  aluno: Omit<Aluno, 'id'>
): Pick<AlunoRow, 'nome' | 'telefone' | 'tipo_aula' | 'nivel' | 'observacoes'> {
  return {
    nome: aluno.nome,
    telefone: aluno.telefone,
    tipo_aula: aluno.tipoAula,
    nivel: aluno.nivel,
    observacoes: aluno.observacoes ?? '',
  };
}

export function alunoToUpdatePayload(
  dados: Partial<Omit<Aluno, 'id'>>
): Partial<
  Pick<AlunoRow, 'nome' | 'telefone' | 'tipo_aula' | 'nivel' | 'observacoes' | 'valor_mensal'>
> {
  const out: Partial<
    Pick<AlunoRow, 'nome' | 'telefone' | 'tipo_aula' | 'nivel' | 'observacoes' | 'valor_mensal'>
  > = {};
  if (dados.nome !== undefined) out.nome = dados.nome;
  if (dados.telefone !== undefined) out.telefone = dados.telefone;
  if (dados.tipoAula !== undefined) out.tipo_aula = dados.tipoAula;
  if (dados.nivel !== undefined) out.nivel = dados.nivel;
  if (dados.observacoes !== undefined) out.observacoes = dados.observacoes;
  if (dados.valorMensal !== undefined) out.valor_mensal = dados.valorMensal;
  return out;
}
