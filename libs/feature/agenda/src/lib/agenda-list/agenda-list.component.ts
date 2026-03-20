import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AulaAgendamentoComAluno } from '@sinaliza/data-access-agenda';
import { ButtonComponent } from '@sinaliza/ui-components';

@Component({
  selector: 'librasflow-agenda-list',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './agenda-list.component.html',
  styleUrl: './agenda-list.component.css',
})
export class AgendaListComponent {
  @Input() tituloDia = '';
  @Input() itens: AulaAgendamentoComAluno[] = [];
  @Output() novoClicked = new EventEmitter<void>();
  @Output() excluirClicked = new EventEmitter<string>();
}
