import { AsyncPipe } from '@angular/common';
import { Component, NgZone, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AgendaDataAccessError,
  AgendaService,
  NovoAulaAgendamento,
} from '@sinaliza/data-access-agenda';
import { Aluno, AlunosDataAccessError, AlunosService } from '@sinaliza/data-access-alunos';
import { Observable, Subject, concat, merge, of } from 'rxjs';
import { catchError, finalize, first, map, switchMap } from 'rxjs/operators';
import { AgendaFormComponent } from '../agenda-form/agenda-form.component';

/** Estado do carregamento de alunos (async pipe força detecção de mudanças). */
interface AgendaFormAlunosVm {
  loading: boolean;
  error: string | null;
  alunos: Aluno[];
}

@Component({
  selector: 'librasflow-agenda-form-page',
  standalone: true,
  imports: [AgendaFormComponent, RouterLink, AsyncPipe],
  templateUrl: './agenda-form-page.component.html',
  styleUrl: './agenda-form-page.component.css',
})
export class AgendaFormPageComponent implements OnInit {
  form!: FormGroup;
  diasMarcados = new Set<number>();
  diasErro = false;
  saving = false;
  saveError: string | null = null;

  private readonly loadAlunos$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly alunosService = inject(AlunosService);
  private readonly agendaService = inject(AgendaService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  /**
   * Mesmo padrão da lista de alunos: `merge(of(undefined), …)` dispara a primeira carga ao assinar;
   * `AsyncPipe` atualiza a view quando a resposta do Supabase chega fora da NgZone.
   */
  readonly alunosVm$: Observable<AgendaFormAlunosVm> = merge(
    of(undefined),
    this.loadAlunos$
  ).pipe(
    switchMap(() =>
      concat(
        of<AgendaFormAlunosVm>({
          loading: true,
          error: null,
          alunos: [],
        }),
        this.alunosService.listar().pipe(
          map(
            (lista): AgendaFormAlunosVm => ({
              loading: false,
              error: null,
              alunos: lista ?? [],
            })
          ),
          catchError((err: unknown) =>
            of<AgendaFormAlunosVm>({
              loading: false,
              error: this.mensagemErroAlunos(err),
              alunos: [],
            })
          )
        )
      )
    )
  );

  ngOnInit(): void {
    this.form = this.fb.group({
      alunoId: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFim: [''],
      observacoes: [''],
    });
  }

  toggleDia(valor: number): void {
    if (this.saving) return;
    const next = new Set(this.diasMarcados);
    if (next.has(valor)) {
      next.delete(valor);
    } else {
      next.add(valor);
    }
    this.diasMarcados = next;
    this.diasErro = false;
  }

  onSave(): void {
    if (this.saving) return;
    this.diasErro = this.diasMarcados.size === 0;
    if (this.form.invalid || this.diasErro) {
      this.form.markAllAsTouched();
      return;
    }

    const { alunoId, horaInicio, horaFim, observacoes } = this.form.getRawValue() as {
      alunoId: string;
      horaInicio: string;
      horaFim: string;
      observacoes: string;
    };

    const itens: NovoAulaAgendamento[] = [...this.diasMarcados].map((diaSemana) => ({
      alunoId,
      diaSemana,
      horaInicio,
      horaFim: horaFim?.trim() ? horaFim : null,
      observacoes: observacoes ?? '',
    }));

    this.saving = true;
    this.saveError = null;

    this.agendaService
      .criarVarios(itens)
      .pipe(
        first(),
        finalize(() => {
          this.ngZone.run(() => {
            this.saving = false;
          });
        })
      )
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            void this.router.navigate(['/agenda']);
          });
        },
        error: (err: unknown) => {
          this.ngZone.run(() => {
            this.saveError = this.mensagemErroSalvar(err);
          });
        },
      });
  }

  onCancel(): void {
    void this.router.navigate(['/agenda']);
  }

  carregarAlunos(): void {
    this.loadAlunos$.next();
  }

  private mensagemErroAlunos(err: unknown): string {
    if (err instanceof AlunosDataAccessError) {
      return err.message;
    }
    return 'Não foi possível carregar os alunos.';
  }

  private mensagemErroSalvar(err: unknown): string {
    if (err instanceof AgendaDataAccessError) {
      return err.message;
    }
    return 'Não foi possível salvar os horários.';
  }
}
