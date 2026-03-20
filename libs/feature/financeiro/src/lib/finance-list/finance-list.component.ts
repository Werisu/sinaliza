import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MensalidadeComAluno } from '@sinaliza/data-access-financeiro';
import { ButtonComponent } from '@sinaliza/ui-components';
import { formatarDataBr, formatarMesCompetenciaPt } from '../financeiro-mes.util';

@Component({
  selector: 'librasflow-finance-list',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './finance-list.component.html',
  styleUrl: './finance-list.component.css',
})
export class FinanceListComponent {
  @Input() itens: MensalidadeComAluno[] = [];
  @Output() novoClicked = new EventEmitter<void>();
  @Output() editarClicked = new EventEmitter<string>();
  @Output() alternarPagoClicked = new EventEmitter<MensalidadeComAluno>();
  @Output() cobrarWhatsAppClicked = new EventEmitter<MensalidadeComAluno>();

  formatarValor(v: number): string {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarMes = formatarMesCompetenciaPt;
  formatarData = formatarDataBr;
}
