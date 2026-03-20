import {
  AulaAgendamento,
  AulaAgendamentoComAluno,
  NovoAulaAgendamento,
} from '../types/aula-agendamento.model';
import { AulaAgendamentoRow } from '../types/aula-agendamento-row.model';

function timeToHhMm(isoTime: string): string {
  const part = isoTime.slice(0, 5);
  return part.length === 5 ? part : isoTime;
}

export function aulaAgendamentoRowToDomain(row: AulaAgendamentoRow): AulaAgendamento {
  return {
    id: row.id,
    alunoId: row.aluno_id,
    diaSemana: row.dia_semana,
    horaInicio: timeToHhMm(row.hora_inicio),
    horaFim: row.hora_fim ? timeToHhMm(row.hora_fim) : null,
    observacoes: row.observacoes ?? '',
  };
}

export function aulaAgendamentoRowToComAluno(row: AulaAgendamentoRow): AulaAgendamentoComAluno {
  const base = aulaAgendamentoRowToDomain(row);
  return {
    ...base,
    alunoNome: row.alunos?.nome ?? '(Aluno)',
  };
}

export function novosAgendamentosToInsertPayload(
  itens: NovoAulaAgendamento[]
): Array<{
  aluno_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string | null;
  observacoes: string;
}> {
  return itens.map((n) => ({
    aluno_id: n.alunoId,
    dia_semana: n.diaSemana,
    hora_inicio: n.horaInicio.length === 5 ? `${n.horaInicio}:00` : n.horaInicio,
    hora_fim:
      n.horaFim && n.horaFim.length > 0
        ? n.horaFim.length === 5
          ? `${n.horaFim}:00`
          : n.horaFim
        : null,
    observacoes: n.observacoes ?? '',
  }));
}
