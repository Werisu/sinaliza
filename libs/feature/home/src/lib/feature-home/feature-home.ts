import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlunosService } from '@sinaliza/data-access-alunos';
import { AgendaService } from '@sinaliza/data-access-agenda';
import { FinanceiroService } from '@sinaliza/data-access-financeiro';
import type { MensalidadeComAluno } from '@sinaliza/data-access-financeiro';
import {
  formatarMesCompetenciaPt,
  formatarMoedaBr,
  hojeIsoLocal,
  primeiroDiaMes,
  yyyyMmFromDate,
  yyyyMmMesAnterior,
} from './dash-mes.util';

@Component({
  selector: 'lib-feature-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './feature-home.html',
  styleUrl: './feature-home.css',
})
export class FeatureHome implements OnInit {
  private readonly alunosService = inject(AlunosService);
  private readonly agendaService = inject(AgendaService);
  private readonly financeiroService = inject(FinanceiroService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly hojeLongo = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  loading = true;
  mesCompetenciaLabel = '';

  totalAlunos = 0;
  horariosGradeSemanal = 0;
  /** % do valor previsto no mês que já foi pago. */
  metaRecebimentosPct = 0;
  pendenciasMes = 0;
  /** Positivo = mais pendências que no mês anterior. */
  pendenciasDeltaVsMesAnterior: number = 0;

  totalPrevistoMes = 0;
  totalRecebidoMes = 0;
  totalPagoHoje = 0;
  /** Variação % recebido vs mês anterior; null se não houver base de comparação. */
  recebidoVariacaoMesPct: number | null = null;

  ngOnInit(): void {
    const yyyyMm = yyyyMmFromDate(new Date());
    const refAtual = primeiroDiaMes(yyyyMm);
    const refAnterior = primeiroDiaMes(yyyyMmMesAnterior(yyyyMm));
    this.mesCompetenciaLabel = formatarMesCompetenciaPt(refAtual);
    const hoje = hojeIsoLocal();

    forkJoin({
      alunos: this.alunosService.listar().pipe(catchError(() => of([]))),
      agenda: this.agendaService.listarComAluno().pipe(catchError(() => of([]))),
      mensAtual: this.financeiroService.listarPorReferenciaMes(refAtual).pipe(catchError(() => of([]))),
      mensAnterior: this.financeiroService
        .listarPorReferenciaMes(refAnterior)
        .pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ alunos, agenda, mensAtual, mensAnterior }) => {
        this.totalAlunos = alunos.length;
        this.horariosGradeSemanal = agenda.length;

        this.totalPrevistoMes = somaValor(mensAtual);
        this.totalRecebidoMes = somaValorPago(mensAtual);
        this.totalPagoHoje = somaPagoNaData(mensAtual, hoje);
        this.pendenciasMes = mensAtual.filter((m) => m.status === 'pendente').length;

        this.metaRecebimentosPct =
          this.totalPrevistoMes > 0
            ? Math.round((this.totalRecebidoMes / this.totalPrevistoMes) * 100)
            : 0;

        const pendAnt = mensAnterior.filter((m) => m.status === 'pendente').length;
        this.pendenciasDeltaVsMesAnterior = this.pendenciasMes - pendAnt;

        const recebAnt = somaValorPago(mensAnterior);
        if (recebAnt > 0) {
          this.recebidoVariacaoMesPct = Math.round(
            ((this.totalRecebidoMes - recebAnt) / recebAnt) * 100
          );
        } else if (this.totalRecebidoMes > 0) {
          this.recebidoVariacaoMesPct = null;
        } else {
          this.recebidoVariacaoMesPct = null;
        }

        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  formatarMoeda(valor: number): string {
    return formatarMoedaBr(valor);
  }
}

function somaValor(itens: MensalidadeComAluno[]): number {
  return itens.reduce((acc, m) => acc + (Number.isFinite(m.valor) ? m.valor : 0), 0);
}

function somaValorPago(itens: MensalidadeComAluno[]): number {
  return itens
    .filter((m) => m.status === 'pago')
    .reduce((acc, m) => acc + (Number.isFinite(m.valor) ? m.valor : 0), 0);
}

function somaPagoNaData(itens: MensalidadeComAluno[], isoDia: string): number {
  return itens
    .filter((m) => m.status === 'pago' && m.pagoEm && m.pagoEm.slice(0, 10) === isoDia)
    .reduce((acc, m) => acc + (Number.isFinite(m.valor) ? m.valor : 0), 0);
}
