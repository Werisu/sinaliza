import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AgendaDataAccessError,
  AgendaService,
  AulaAgendamentoComAluno,
} from '@sinaliza/data-access-agenda';
import { Observable, Subject, concat, merge, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DIAS_SEMANA_UI } from '../agenda-dias';
import { AgendaListComponent } from '../agenda-list/agenda-list.component';

interface AgendaListViewModel {
  loading: boolean;
  error: string | null;
  itens: AulaAgendamentoComAluno[];
}

@Component({
  selector: 'librasflow-agenda-list-page',
  standalone: true,
  imports: [AgendaListComponent, AsyncPipe],
  templateUrl: './agenda-list-page.component.html',
  styleUrl: './agenda-list-page.component.css',
})
export class AgendaListPageComponent {
  private readonly load$ = new Subject<void>();
  private readonly agendaService = inject(AgendaService);
  private readonly router = inject(Router);

  readonly diasSemana = DIAS_SEMANA_UI;
  readonly selectedDia = signal<number>(new Date().getDay());

  readonly vm$: Observable<AgendaListViewModel> = merge(
    of(undefined),
    this.load$
  ).pipe(
    switchMap(() =>
      concat(
        of<AgendaListViewModel>({
          loading: true,
          error: null,
          itens: [],
        }),
        this.agendaService.listarComAluno().pipe(
          map(
            (lista): AgendaListViewModel => ({
              loading: false,
              error: null,
              itens: lista ?? [],
            })
          ),
          catchError((err: unknown) =>
            of<AgendaListViewModel>({
              loading: false,
              error: this.mensagemErro(err),
              itens: [],
            })
          )
        )
      )
    )
  );

  tituloDiaSelecionado(): string {
    const d = this.selectedDia();
    return this.diasSemana.find((x) => x.valor === d)?.rotulo ?? '';
  }

  itensDoDia(itens: AulaAgendamentoComAluno[]): AulaAgendamentoComAluno[] {
    const d = this.selectedDia();
    return itens
      .filter((i) => i.diaSemana === d)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }

  selecionarDia(valor: number): void {
    this.selectedDia.set(valor);
  }

  carregar(): void {
    this.load$.next();
  }

  onNovo(): void {
    void this.router.navigate(['/agenda', 'novo']);
  }

  onExcluir(id: string): void {
    if (!confirm('Remover este horário fixo da agenda?')) {
      return;
    }
    this.agendaService.excluir(id).subscribe({
      next: () => this.carregar(),
      error: (err: unknown) => {
        alert(this.mensagemErro(err));
      },
    });
  }

  private mensagemErro(err: unknown): string {
    if (err instanceof AgendaDataAccessError) {
      return err.message;
    }
    return 'Não foi possível carregar a agenda.';
  }
}
