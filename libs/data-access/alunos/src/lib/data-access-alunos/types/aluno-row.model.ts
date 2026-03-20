import { Nivel, TipoAula } from './aluno.model';

/**
 * Linha da tabela `public.alunos` no Postgres (snake_case).
 * Isolado do modelo de domínio para mapeamento explícito.
 */
export interface AlunoRow {
  id: string;
  nome: string;
  telefone: string;
  tipo_aula: TipoAula;
  nivel: Nivel;
  observacoes: string | null;
}
