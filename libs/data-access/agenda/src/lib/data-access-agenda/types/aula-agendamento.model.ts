/**
 * Regra de recorrência semanal: um aluno em um dia da semana com horário fixo.
 * `diaSemana`: 0 = domingo … 6 = sábado (mesma convenção de `Date.getDay()`).
 */
export interface AulaAgendamento {
  id: string;
  alunoId: string;
  diaSemana: number;
  /** Formato HH:mm (24h). */
  horaInicio: string;
  horaFim: string | null;
  observacoes: string;
}

/** Item para listagens com nome do aluno (join). */
export interface AulaAgendamentoComAluno extends AulaAgendamento {
  alunoNome: string;
}

export interface NovoAulaAgendamento {
  alunoId: string;
  diaSemana: number;
  horaInicio: string;
  horaFim?: string | null;
  observacoes?: string;
}
