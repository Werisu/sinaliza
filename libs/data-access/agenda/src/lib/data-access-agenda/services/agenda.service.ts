import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AulaAgendamentosRepository } from '../repositories/aula-agendamentos.repository';
import { AulaAgendamentoComAluno, NovoAulaAgendamento } from '../types/aula-agendamento.model';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly repo = inject(AulaAgendamentosRepository);

  listarComAluno(): Observable<AulaAgendamentoComAluno[]> {
    return this.repo.listarComAluno();
  }

  /** Um insert em lote: vários dias da semana para o mesmo horário/aluno. */
  criarVarios(itens: NovoAulaAgendamento[]): Observable<AulaAgendamentoComAluno[]> {
    return this.repo.criarVarios(itens);
  }

  excluir(id: string): Observable<boolean> {
    return this.repo.excluir(id);
  }
}
