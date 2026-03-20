import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  FinanceiroDataAccessError,
  FinanceiroService,
  MensalidadeComAluno,
} from '@sinaliza/data-access-financeiro';
import { BehaviorSubject, Observable, Subject, concat, merge, of } from 'rxjs';
import { catchError, first, map, switchMap, take } from 'rxjs/operators';
import { montarMensagemCobranca, urlWhatsAppCobranca } from '../cobranca-whatsapp.util';
import { primeiroDiaMes, yyyyMmFromDate } from '../financeiro-mes.util';
import { FinanceListComponent } from '../finance-list/finance-list.component';

interface FinanceListVm {
  loading: boolean;
  error: string | null;
  itens: MensalidadeComAluno[];
}

@Component({
  selector: 'librasflow-finance-list-page',
  standalone: true,
  imports: [FinanceListComponent, AsyncPipe],
  templateUrl: './finance-list-page.component.html',
  styleUrl: './finance-list-page.component.css',
})
export class FinanceListPageComponent {
  private readonly financeiroService = inject(FinanceiroService);
  private readonly router = inject(Router);

  readonly mesInicial = yyyyMmFromDate(new Date());
  mesSelecionado = this.mesInicial;

  private readonly mesYyyyMm$ = new BehaviorSubject<string>(this.mesInicial);
  private readonly recarregar$ = new Subject<void>();

  readonly vm$: Observable<FinanceListVm> = merge(
    this.mesYyyyMm$,
    this.recarregar$.pipe(switchMap(() => this.mesYyyyMm$.pipe(take(1))))
  ).pipe(
    switchMap((yyyyMm) =>
      concat(
        of<FinanceListVm>({ loading: true, error: null, itens: [] }),
        this.financeiroService.listarPorReferenciaMes(primeiroDiaMes(yyyyMm)).pipe(
          map(
            (lista): FinanceListVm => ({
              loading: false,
              error: null,
              itens: lista ?? [],
            })
          ),
          catchError((err: unknown) =>
            of<FinanceListVm>({
              loading: false,
              error: this.mensagemErro(err),
              itens: [],
            })
          )
        )
      )
    )
  );

  onMesChange(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    if (!v) return;
    this.mesSelecionado = v;
    this.mesYyyyMm$.next(v);
  }

  carregar(): void {
    this.recarregar$.next();
  }

  onNovo(): void {
    void this.router.navigate(['/financeiro', 'novo']);
  }

  onEditar(id: string): void {
    void this.router.navigate(['/financeiro', id, 'editar']);
  }

  onAlternarPago(item: MensalidadeComAluno): void {
    const novo = item.status === 'pago' ? 'pendente' : 'pago';
    this.financeiroService
      .atualizar(item.id, {
        status: novo,
        pagoEm: novo === 'pago' ? new Date().toISOString() : null,
      })
      .pipe(first())
      .subscribe({
        next: () => this.carregar(),
        error: (err: unknown) => alert(this.mensagemErro(err)),
      });
  }

  onCobrarWhatsApp(item: MensalidadeComAluno): void {
    const texto = montarMensagemCobranca({
      nomeAluno: item.alunoNome,
      referenciaMes: item.referenciaMes,
      valor: item.valor,
      dataVencimento: item.dataVencimento,
    });
    const url = urlWhatsAppCobranca(item.alunoTelefone, texto);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Telefone do aluno não permite abrir o WhatsApp. Verifique o cadastro.');
    }
  }

  private mensagemErro(err: unknown): string {
    if (err instanceof FinanceiroDataAccessError) {
      return err.message;
    }
    return 'Não foi possível carregar as mensalidades.';
  }
}
