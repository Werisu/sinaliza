import { Injectable, inject } from '@angular/core';
import { PostgrestError } from '@supabase/supabase-js';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlunosDataAccessError, mapPostgrestError } from '../errors/alunos-data-access.error';
import {
  alunoRowToDomain,
  alunoToInsertPayload,
  alunoToUpdatePayload,
} from '../mappers/aluno.mapper';
import { Aluno } from '../types/aluno.model';
import { AlunoRow } from '../types/aluno-row.model';
import { SupabaseBrowserClient } from '../supabase/supabase-browser.client';

const TABLE = 'alunos';

/**
 * Acesso exclusivo à tabela `alunos` via Supabase.
 * A UI e o serviço de domínio não conhecem PostgREST.
 */
@Injectable({ providedIn: 'root' })
export class AlunosRepository {
  private readonly supabase = inject(SupabaseBrowserClient).client;

  listar(): Observable<Aluno[]> {
    // Observable explícito: o builder do Supabase como Thenable + RxJS `from()`
    // em alguns bundlers não emite/completa de forma confiável; assim garantimos next + complete.
    return new Observable<Aluno[]>((subscriber) => {
      const query = this.supabase
        .from(TABLE)
        .select('*')
        .order('nome', { ascending: true });

      void Promise.resolve(query)
        .then((result) => {
          if (subscriber.closed) return;
          const { data, error } = result as {
            data: AlunoRow[] | null;
            error: PostgrestError | null;
          };
          if (error) {
            subscriber.error(mapPostgrestError(error));
            return;
          }
          const rows = data ?? [];
          try {
            subscriber.next(rows.map((row) => alunoRowToDomain(row)));
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

      return () => {
        /* cancelamento: Supabase não expõe AbortSignal fácil no JS client */
      };
    }).pipe(catchError((err) => this.wrapUnexpected(err)));
  }

  obterPorId(id: string): Observable<Aluno | undefined> {
    return new Observable<Aluno | undefined>((subscriber) => {
      let cancelled = false;

      void (async () => {
        try {
          // `await` no builder do Supabase é mais fiável que `Promise.resolve(query)` + `.then()`
          // com `maybeSingle()` em alguns bundlers (evita fluxo que nunca completa).
          const { data, error } = await this.supabase
            .from(TABLE)
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (cancelled || subscriber.closed) return;

          if (error) {
            subscriber.error(mapPostgrestError(error));
            return;
          }
          if (!data) {
            subscriber.next(undefined);
            subscriber.complete();
            return;
          }
          subscriber.next(alunoRowToDomain(data as AlunoRow));
          subscriber.complete();
        } catch (err: unknown) {
          if (!cancelled && !subscriber.closed) {
            subscriber.error(err);
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }).pipe(catchError((err) => this.wrapUnexpected(err)));
  }

  criar(aluno: Omit<Aluno, 'id'>): Observable<Aluno> {
    const payload = alunoToInsertPayload(aluno);
    return new Observable<Aluno>((subscriber) => {
      const query = this.supabase.from(TABLE).insert(payload).select('*').single();

      void Promise.resolve(query)
        .then((result) => {
          if (subscriber.closed) return;
          const { data, error } = result as {
            data: AlunoRow | null;
            error: PostgrestError | null;
          };
          if (error) {
            subscriber.error(mapPostgrestError(error));
            return;
          }
          if (!data) {
            subscriber.error(
              new AlunosDataAccessError('Resposta vazia ao criar aluno.')
            );
            return;
          }
          try {
            subscriber.next(alunoRowToDomain(data as AlunoRow));
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

  atualizar(
    id: string,
    dados: Partial<Omit<Aluno, 'id'>>
  ): Observable<Aluno | undefined> {
    const payload = alunoToUpdatePayload(dados);
    if (Object.keys(payload).length === 0) {
      return this.obterPorId(id);
    }
    return new Observable<Aluno | undefined>((subscriber) => {
      const query = this.supabase
        .from(TABLE)
        .update(payload)
        .eq('id', id)
        .select('*')
        .maybeSingle();

      void Promise.resolve(query)
        .then((result) => {
          if (subscriber.closed) return;
          const { data, error } = result as {
            data: AlunoRow | null;
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
            subscriber.next(alunoRowToDomain(data as AlunoRow));
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
            data: unknown;
            error: PostgrestError | null;
          };
          if (error) {
            subscriber.error(mapPostgrestError(error));
            return;
          }
          const rows = data ?? [];
          try {
            subscriber.next(Array.isArray(rows) && rows.length > 0);
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

  private wrapUnexpected(err: unknown): Observable<never> {
    if (err instanceof AlunosDataAccessError) {
      return throwError(() => err);
    }
    return throwError(
      () =>
        new AlunosDataAccessError(
          'Falha inesperada ao acessar os dados.',
          undefined,
          undefined,
          err as unknown
        )
    );
  }
}
