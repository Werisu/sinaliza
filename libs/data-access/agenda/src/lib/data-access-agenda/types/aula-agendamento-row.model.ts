/** Linha em `aula_agendamentos` + embed opcional de `alunos`. */
export interface AulaAgendamentoRow {
  id: string;
  aluno_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string | null;
  observacoes: string;
  created_at: string;
  alunos?: { nome: string } | null;
}
