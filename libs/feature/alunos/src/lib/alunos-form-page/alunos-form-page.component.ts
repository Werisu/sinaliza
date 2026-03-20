import { Component, NgZone, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, first } from 'rxjs/operators';
import {
  Aluno,
  AlunosDataAccessError,
  AlunosService,
  Nivel,
  TipoAula,
} from '@sinaliza/data-access-alunos';
import { AlunosFormComponent } from '../alunos-form/alunos-form.component';

@Component({
  selector: 'librasflow-alunos-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, AlunosFormComponent],
  templateUrl: './alunos-form-page.component.html',
  styleUrl: './alunos-form-page.component.css',
})
export class AlunosFormPageComponent {
  form!: FormGroup;
  isEdit = false;
  loading = false;
  saving = false;
  loadError: string | null = null;
  saveError: string | null = null;
  private alunoId?: string;

  private readonly fb = inject(FormBuilder);
  private readonly alunosService = inject(AlunosService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly ngZone = inject(NgZone);

  ngOnInit(): void {
    this.form = this.criarForm();
    this.alunoId = this.route.snapshot.paramMap.get('id') ?? undefined;
    this.isEdit = !!this.alunoId;

    if (this.alunoId) {
      this.carregarAluno();
    }
  }

  private criarForm(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      telefone: ['', [Validators.required]],
      valorMensal: [null as number | string | null],
      tipoAula: ['', Validators.required],
      nivel: ['', Validators.required],
      observacoes: [''],
    });
  }

  private carregarAluno(): void {
    if (!this.alunoId) return;
    this.loading = true;
    this.loadError = null;
    this.alunosService
      .obterPorId(this.alunoId)
      .pipe(
        finalize(() => {
          this.ngZone.run(() => {
            this.loading = false;
          });
        })
      )
      .subscribe({
        next: (aluno) => {
          this.ngZone.run(() => {
            if (aluno) {
              this.form.patchValue(aluno);
            } else {
              this.loadError = 'Aluno não encontrado.';
            }
          });
        },
        error: (err: unknown) => {
          this.ngZone.run(() => {
            this.loadError = this.mensagemErro(
              err,
              'Não foi possível carregar o aluno.'
            );
          });
        },
      });
  }

  onSave(): void {
    if (this.saving) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue() as {
      nome: string;
      telefone: string;
      tipoAula: TipoAula;
      nivel: Nivel;
      observacoes: string;
      valorMensal: number | string | null;
    };
    const valorMensalParseado = this.parseValorMensal(raw.valorMensal);
    if (valorMensalParseado === false) {
      this.saveError = 'Valor mensal inválido.';
      return;
    }
    const valor: Omit<Aluno, 'id'> = {
      nome: raw.nome,
      telefone: raw.telefone,
      tipoAula: raw.tipoAula,
      nivel: raw.nivel,
      observacoes: raw.observacoes ?? '',
      valorMensal: valorMensalParseado,
    };

    this.saving = true;
    this.saveError = null;

    const req =
      this.isEdit && this.alunoId
        ? this.alunosService.atualizar(this.alunoId, valor)
        : this.alunosService.criar(valor);

    req
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
            this.router.navigate(['/alunos']);
          });
        },
        error: (err: unknown) => {
          this.ngZone.run(() => {
            this.saveError = this.mensagemErro(err, 'Não foi possível salvar.');
          });
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/alunos']);
  }

  /** `null` ok; `false` = inválido */
  private parseValorMensal(v: unknown): number | null | false {
    if (v === '' || v === null || v === undefined) return null;
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n) || n < 0) return false;
    return n;
  }

  private mensagemErro(err: unknown, fallback: string): string {
    if (err instanceof AlunosDataAccessError) {
      return err.message;
    }
    return fallback;
  }
}
