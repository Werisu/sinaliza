import { Injectable, inject } from '@angular/core';
import { PostgrestError } from '@supabase/supabase-js';
import { SupabaseBrowserClient } from '@sinaliza/data-access-alunos';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  FinanceiroDataAccessError,
  mapPostgrestError,
} from '../errors/financeiro-data-access.error';
import {
  mensalidadeRowToComAluno,
  mensalidadeUpdatePayload,
  novaMensalidadeToInsertPayload,
} from '../mappers/mensalidade.mapper';
import { MensalidadeComAluno, NovaMensalidade } from '../types/mensalidade.model';
import { MensalidadeRow } from '../types/mensalidade-row.model';

const TABLE = 'mensalidades';

const SELECT_COM_ALUNO =
  'id, aluno_id, referencia_mes, valor, status, data_vencimento, pago_em, observacoes, created_at, updated_at, alunos(nome, telefone)';

@Injectable({ providedIn: 'root' })
export class MensalidadesRepository {
  private readonly supabase = inject(SupabaseBrowserClient).client;

  listarPorReferenciaMes(referenciaMesPrimeiroDia: string): Observable<MensalidadeComAluno[]> {
    return new Observable<MensalidadeComAluno[]>((subscriber) => {
      const query = this.supabase
        .from(TABLE)
        .select(SELECT_COM_ALUNO)
        .eq('referencia_mes', referenciaMesPrimeiroDia)
        .order('data_vencimento', { ascending: true });

      void Promise.resolve(query)
        .then((result) => {
          if (subscriber.closed) return;
          const { data, error } = result as {
            data: MensalidadeRow[] | null;
            error: PostgrestError | null;
          };
          if (error) {
            subscriber.error(mapPostgrestError(error));
            return;
          }
          const rows = data ?? [];
          try {
            subscriber.next(rows.map((row) => mensalidadeRowToComAluno(row)));
            subscriber.complete();
          } catch (e) {
            subscriber.error(e);
          }
        })
        .catch((err: unknown) => {
          if (!subscriber.closed) subscriber.error(err);
        });

      return () => {};
    }).pipe(catchError((err) => this.wrapUnexpected(err)));
  }

  obterPorId(id: string): Observable<MensalidadeComAluno | undefined> {
    return new Observable<MensalidadeComAluno | undefined>((subscriber) => {
      const query = this.supabase.from(TABLE).select(SELECT_COM_ALUNO).eq('id', id).maybeSingle();

      void Promise.resolve(query)
        .then((result) => {
          if (subscriber.closed) return;
          const { data, error } = result as {
            data: MensalidadeRow | null;
            error: PostgrestError | null;
          };
          if (error) {
            subscriber.error(mapPostgrestError(error));
            return;
          }
          if (!data) {
            subscriber.next(undefined);
            subscriber.complete();
            return;
          }
          try {
            subscriber.next(mensalidadeRowToComAluno(data));
            subscriber.complete();
          } catch (e) {
            subscriber.error(e);
          }
        })
        .catch((err: unknown) => {
          if (!subscriber.closed) subscriber.error(err);
        });

      return () => {};
    }).pipe(catchError((err) => this.wrapUnexpected(err)));
  }

  criar(nova: NovaMensalidade): Observable<MensalidadeComAluno> {
    const payload = novaMensalidadeToInsertPayload(nova);
    return new Observable<MensalidadeComAluno>((subscriber) => {
      const query = this.supabase.from(TABLE).insert(payload).select(SELECT_COM_ALUNO).single();

      void Promise.resolve(query)
        .then((result) => {
          if (subscriber.closed) return;
          const { data, error } = result as {
            data: MensalidadeRow | null;
            error: PostgrestError | null;
          };
          if (error) {
            subscriber.error(mapPostgrestError(error));
            return;
          }
          if (!data) {
            subscriber.error(new FinanceiroDataAccessError('Registro não retornado após inserir.'));
            return;
          }
          try {
            subscriber.next(mensalidadeRowToComAluno(data));
            subscriber.complete();
          } catch (e) {
            subscriber.error(e);
          }
        })
        .catch((err: unknown) => {
          if (!subscriber.closed) subscriber.error(err);
        });

      return () => {};
    }).pipe(catchError((err) => this.wrapUnexpected(err)));
  }

  atualizar(
    id: string,
    dados: Parameters<typeof mensalidadeUpdatePayload>[0]
  ): Observable<MensalidadeComAluno | undefined> {
    const payload = mensalidadeUpdatePayload(dados);
    return new Observable<MensalidadeComAluno | undefined>((subscriber) => {
      const query = this.supabase
        .from(TABLE)
        .update(payload)
        .eq('id', id)
        .select(SELECT_COM_ALUNO)
        .maybeSingle();

      void Promise.resolve(query)
        .then((result) => {
          if (subscriber.closed) return;
          const { data, error } = result as {
            data: MensalidadeRow | null;
            error: PostgrestError | null;
          };
          if (error) {
            subscriber.error(mapPostgrestError(error));
            return;
          }
          if (!data) {
            subscriber.next(undefined);
            subscriber.complete();
            return;
          }
          try {
            subscriber.next(mensalidadeRowToComAluno(data));
            subscriber.complete();
          } catch (e) {
            subscriber.error(e);
          }
        })
        .catch((err: unknown) => {
          if (!subscriber.closed) subscriber.error(err);
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
          if (!subscriber.closed) subscriber.error(err);
        });

      return () => {};
    }).pipe(catchError((err) => this.wrapUnexpected(err)));
  }

  private wrapUnexpected(err: unknown): Observable<never> {
    if (err instanceof FinanceiroDataAccessError) {
      return throwError(() => err);
    }
    return throwError(
      () =>
        new FinanceiroDataAccessError(
          'Falha inesperada ao acessar dados financeiros.',
          undefined,
          undefined,
          err as unknown
        )
    );
  }
}
