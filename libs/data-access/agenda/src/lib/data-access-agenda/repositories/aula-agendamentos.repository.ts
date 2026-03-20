import { Injectable, inject } from '@angular/core';
import { PostgrestError } from '@supabase/supabase-js';
import { SupabaseBrowserClient } from '@sinaliza/data-access-alunos';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AgendaDataAccessError, mapPostgrestError } from '../errors/agenda-data-access.error';
import {
  aulaAgendamentoRowToComAluno,
  novosAgendamentosToInsertPayload,
} from '../mappers/aula-agendamento.mapper';
import { AulaAgendamentoComAluno, NovoAulaAgendamento } from '../types/aula-agendamento.model';
import { AulaAgendamentoRow } from '../types/aula-agendamento-row.model';

const TABLE = 'aula_agendamentos';

const SELECT_COM_ALUNO =
  'id, aluno_id, dia_semana, hora_inicio, hora_fim, observacoes, created_at, alunos(nome)';

@Injectable({ providedIn: 'root' })
export class AulaAgendamentosRepository {
  private readonly supabase = inject(SupabaseBrowserClient).client;

  listarComAluno(): Observable<AulaAgendamentoComAluno[]> {
    return new Observable<AulaAgendamentoComAluno[]>((subscriber) => {
      const query = this.supabase
        .from(TABLE)
        .select(SELECT_COM_ALUNO)
        .order('dia_semana', { ascending: true })
        .order('hora_inicio', { ascending: true });

      void Promise.resolve(query)
        .then((result) => {
          if (subscriber.closed) return;
          const { data, error } = result as {
            data: AulaAgendamentoRow[] | null;
            error: PostgrestError | null;
          };
          if (error) {
            subscriber.error(mapPostgrestError(error));
            return;
          }
          const rows = data ?? [];
          try {
            subscriber.next(rows.map((row) => aulaAgendamentoRowToComAluno(row)));
            subscriber.complete();
          } catch (e) {
            subscriber.error(e);
          }
        })
        .catch((err: unknown) => {
          if (!subscriber.closed) {
            subscriber.error(err);
          }
        });

      return () => {};
    }).pipe(catchError((err) => this.wrapUnexpected(err)));
  }

  criarVarios(itens: NovoAulaAgendamento[]): Observable<AulaAgendamentoComAluno[]> {
    if (itens.length === 0) {
      return new Observable((sub) => {
        sub.next([]);
        sub.complete();
      });
    }
    const payload = novosAgendamentosToInsertPayload(itens);
    return new Observable<AulaAgendamentoComAluno[]>((subscriber) => {
      const query = this.supabase.from(TABLE).insert(payload).select(SELECT_COM_ALUNO);

      void Promise.resolve(query)
        .then((result) => {
          if (subscriber.closed) return;
          const { data, error } = result as {
            data: AulaAgendamentoRow[] | null;
            error: PostgrestError | null;
          };
          if (error) {
            subscriber.error(mapPostgrestError(error));
            return;
          }
          const rows = data ?? [];
          try {
            subscriber.next(rows.map((row) => aulaAgendamentoRowToComAluno(row)));
            subscriber.complete();
          } catch (e) {
            subscriber.error(e);
          }
        })
        .catch((err: unknown) => {
          if (!subscriber.closed) {
            subscriber.error(err);
          }
        });

      return () => {};
    }).pipe(catchError((err) => this.wrapUnexpected(err)));
  }

  excluir(id: string): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      const query = this.supabase.from(TABLE).delete().eq('id', id).select('id');

      void Promise.resolve(query)
        .then((result) => {
          if (subscriber.closed) return;
          const { data, error } = result as {
            data: { id: string }[] | null;
            error: PostgrestError | null;
          };
          if (error) {
            subscriber.error(mapPostgrestError(error));
            return;
          }
          const rows = data ?? [];
          subscriber.next(Array.isArray(rows) && rows.length > 0);
          subscriber.complete();
        })
        .catch((err: unknown) => {
          if (!subscriber.closed) {
            subscriber.error(err);
          }
        });

      return () => {};
    }).pipe(catchError((err) => this.wrapUnexpected(err)));
  }

  private wrapUnexpected(err: unknown): Observable<never> {
    if (err instanceof AgendaDataAccessError) {
      return throwError(() => err);
    }
    return throwError(
      () =>
        new AgendaDataAccessError(
          'Falha inesperada ao acessar a agenda.',
          undefined,
          undefined,
          err as unknown
        )
    );
  }
}
