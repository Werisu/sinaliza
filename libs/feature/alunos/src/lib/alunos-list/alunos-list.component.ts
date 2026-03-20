import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Aluno } from '@sinaliza/data-access-alunos';
import { ButtonComponent } from '@sinaliza/ui-components';

@Component({
  selector: 'librasflow-alunos-list',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './alunos-list.component.html',
  styleUrl: './alunos-list.component.css',
})
export class AlunosListComponent {
  @Input() alunos: Aluno[] = [];
  @Output() novoClicked = new EventEmitter<void>();
  @Output() editarClicked = new EventEmitter<string>();
}
