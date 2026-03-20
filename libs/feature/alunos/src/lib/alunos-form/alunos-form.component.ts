import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormFieldComponent, ButtonComponent } from '@sinaliza/ui-components';
import { Nivel, TipoAula } from '@sinaliza/data-access-alunos';

@Component({
  selector: 'librasflow-alunos-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, ButtonComponent],
  templateUrl: './alunos-form.component.html',
  styleUrl: './alunos-form.component.css',
})
export class AlunosFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() isEdit = false;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  readonly tiposAula: TipoAula[] = ['presencial', 'online', 'semipresencial'];
  readonly niveis: Nivel[] = ['básico', 'intermediário', 'avançado'];
}
