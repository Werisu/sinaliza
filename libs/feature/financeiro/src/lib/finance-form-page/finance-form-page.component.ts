import { AsyncPipe } from '@angular/common';
import { Component, NgZone, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FinanceiroDataAccessError,
  FinanceiroService,
  MensalidadeComAluno,
  MensalidadeStatus,
  NovaMensalidade,
} from '@sinaliza/data-access-financeiro';
import { Aluno, AlunosDataAccessError, AlunosService } from '@sinaliza/data-access-alunos';
import { Observable, Subject, concat, merge, of } from 'rxjs';
import { catchError, finalize, first, map, switchMap, tap } from 'rxjs/operators';
import { formatarMesCompetenciaPt, primeiroDiaMes, yyyyMmFromDate } from '../financeiro-mes.util';
import { FinanceFormComponent } from '../finance-form/finance-form.component';

interface AlunosVm {
  loading: boolean;
  error: string | null;
  alunos: Aluno[];
}

interface EditVm {
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'librasflow-finance-form-page',
  standalone: true,
  imports: [FinanceFormComponent, AsyncPipe, RouterLink],
  templateUrl: './finance-form-page.component.html',
  styleUrl: './finance-form-page.component.css',
})
export class FinanceFormPageComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  private mensalidadeId: string | null = null;

  saving = false;
  saveError: string | null = null;

  alunoNomeFixo = '';
  competenciaFixaLabel = '';

  private readonly loadAlunos$ = new Subject<void>();
  private readonly loadEdit$ = new Subject<void>();

  private readonly fb = inject(FormBuilder);
  private readonly alunosService = inject(AlunosService);
  private readonly financeiroService = inject(FinanceiroService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly ngZone = inject(NgZone);

  readonly alunosVm$: Observable<AlunosVm> = merge(
    of(undefined),
    this.loadAlunos$
  ).pipe(
    switchMap(() =>
      concat(
        of<AlunosVm>({ loading: true, error: null, alunos: [] }),
        this.alunosService.listar().pipe(
          map(
            (lista): AlunosVm => ({
              loading: false,
              error: null,
              alunos: lista ?? [],
            })
          ),
          catchError((err: unknown) =>
            of<AlunosVm>({
              loading: false,
              error: this.mensagemErroAlunos(err),
              alunos: [],
            })
          )
        )
      )
    )
  );

  readonly editVm$: Observable<EditVm> = merge(of(undefined), this.loadEdit$).pipe(
    switchMap(() => {
      if (!this.mensalidadeId) {
        return of<EditVm>({ loading: false, error: null });
      }
      return concat(
        of<EditVm>({ loading: true, error: null }),
        this.financeiroService.obterPorId(this.mensalidadeId).pipe(
          tap((item) => {
            if (item) {
              this.ngZone.run(() => this.aplicarItemNaForm(item));
            }
          }),
          map((item): EditVm => ({
            loading: false,
            error: item ? null : 'Mensalidade não encontrada.',
          })),
          catchError((err: unknown) =>
            of<EditVm>({
              loading: false,
              error: this.mensagemErroFinanceiro(err),
            })
          )
        )
      );
    })
  );

  ngOnInit(): void {
    this.mensalidadeId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.mensalidadeId;

    this.form = this.fb.group({
      alunoId: [''],
      competenciaMes: [yyyyMmFromDate(new Date())],
      valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
      dataVencimento: ['', Validators.required],
      status: ['pendente' as MensalidadeStatus, Validators.required],
      observacoes: [''],
    });

    if (this.isEdit) {
      this.form.get('alunoId')?.clearValidators();
      this.form.get('competenciaMes')?.clearValidators();
    } else {
      this.form.get('alunoId')?.setValidators(Validators.required);
      this.form.get('competenciaMes')?.setValidators(Validators.required);
    }
    this.form.updateValueAndValidity();
  }

  carregarAlunos(): void {
    this.loadAlunos$.next();
  }

  carregarEdicao(): void {
    this.loadEdit$.next();
  }

  aplicarValorPadraoAluno(alunoId: string, alunos: Aluno[]): void {
    const aluno = alunos.find((a) => a.id === alunoId);
    if (aluno?.valorMensal != null) {
      this.form.patchValue({ valor: aluno.valorMensal });
    }
  }

  onSave(): void {
    if (this.saving) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue() as {
      alunoId: string;
      competenciaMes: string;
      valor: number;
      dataVencimento: string;
      status: MensalidadeStatus;
      observacoes: string;
    };

    this.saving = true;
    this.saveError = null;

    if (this.isEdit && this.mensalidadeId) {
      const pagoEm = raw.status === 'pago' ? new Date().toISOString() : null;
      this.financeiroService
        .atualizar(this.mensalidadeId, {
          valor: Number(raw.valor),
          dataVencimento: raw.dataVencimento,
          status: raw.status,
          observacoes: raw.observacoes ?? '',
          pagoEm,
        })
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
            this.ngZone.run(() => void this.router.navigate(['/financeiro']));
          },
          error: (err: unknown) => {
            this.ngZone.run(() => {
              this.saveError = this.mensagemErroFinanceiro(err);
            });
          },
        });
      return;
    }

    const nova: NovaMensalidade = {
      alunoId: raw.alunoId,
      referenciaMes: primeiroDiaMes(raw.competenciaMes),
      valor: Number(raw.valor),
      status: raw.status,
      dataVencimento: raw.dataVencimento,
      observacoes: raw.observacoes ?? '',
    };

    this.financeiroService
      .criar(nova)
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
          this.ngZone.run(() => void this.router.navigate(['/financeiro']));
        },
        error: (err: unknown) => {
          this.ngZone.run(() => {
            this.saveError = this.mensagemErroFinanceiro(err);
          });
        },
      });
  }

  onCancel(): void {
    void this.router.navigate(['/financeiro']);
  }

  private aplicarItemNaForm(item: MensalidadeComAluno): void {
    this.alunoNomeFixo = item.alunoNome;
    this.competenciaFixaLabel = formatarMesCompetenciaPt(item.referenciaMes);
    const yyyyMm = item.referenciaMes.slice(0, 7);
    this.form.patchValue({
      alunoId: item.alunoId,
      competenciaMes: yyyyMm,
      valor: item.valor,
      dataVencimento: item.dataVencimento,
      status: item.status,
      observacoes: item.observacoes,
    });
    this.form.get('alunoId')?.disable();
    this.form.get('competenciaMes')?.disable();
  }

  private mensagemErroAlunos(err: unknown): string {
    if (err instanceof AlunosDataAccessError) {
      return err.message;
    }
    return 'Não foi possível carregar os alunos.';
  }

  private mensagemErroFinanceiro(err: unknown): string {
    if (err instanceof FinanceiroDataAccessError) {
      return err.message;
    }
    return 'Não foi possível concluir a operação.';
  }
}
