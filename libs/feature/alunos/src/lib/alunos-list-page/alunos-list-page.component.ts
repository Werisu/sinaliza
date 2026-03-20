import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, concat, merge, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Aluno, AlunosDataAccessError, AlunosService } from '@sinaliza/data-access-alunos';
import { AlunosListComponent } from '../alunos-list/alunos-list.component';

/** Estado da listagem para o template (async pipe força detecção de mudanças). */
interface AlunosListViewModel {
  loading: boolean;
  error: string | null;
  alunos: Aluno[];
}

@Component({
  selector: 'librasflow-alunos-list-page',
  standalone: true,
  imports: [AlunosListComponent, AsyncPipe],
  templateUrl: './alunos-list-page.component.html',
  styleUrl: './alunos-list-page.component.css',
})
export class AlunosListPageComponent {
  private readonly load$ = new Subject<void>();
  private readonly alunosService = inject(AlunosService);
  private readonly router = inject(Router);

  /**
   * `merge(of(undefined), load$)` dispara a primeira carga ao assinar (async pipe)
   * e novas cargas ao chamar `carregarAlunos()`.
   */
  readonly vm$: Observable<AlunosListViewModel> = merge(
    of(undefined),
    this.load$
  ).pipe(
    switchMap(() =>
      concat(
        of<AlunosListViewModel>({
          loading: true,
          error: null,
          alunos: [],
        }),
        this.alunosService.listar().pipe(
          map(
            (lista): AlunosListViewModel => ({
              loading: false,
              error: null,
              alunos: lista ?? [],
            })
          ),
          catchError((err: unknown) =>
            of<AlunosListViewModel>({
              loading: false,
              error: this.mensagemErro(err),
              alunos: [],
            })
          )
        )
      )
    )
  );

  carregarAlunos(): void {
    this.load$.next();
  }

  onNovo(): void {
    this.router.navigate(['/alunos', 'novo']);
  }

  onEditar(id: string): void {
    this.router.navigate(['/alunos', id, 'editar']);
  }

  private mensagemErro(err: unknown): string {
    if (err instanceof AlunosDataAccessError) {
      return err.message;
    }
    return 'Não foi possível carregar os alunos.';
  }
}
