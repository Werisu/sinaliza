import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Aluno } from '@sinaliza/data-access-alunos';
import { ButtonComponent, FormFieldComponent } from '@sinaliza/ui-components';
import { DIAS_SEMANA_UI } from '../agenda-dias';

@Component({
  selector: 'librasflow-agenda-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, FormFieldComponent],
  templateUrl: './agenda-form.component.html',
  styleUrl: './agenda-form.component.css',
})
export class AgendaFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() alunos: Aluno[] = [];
  @Input() diasMarcados = new Set<number>();
  @Input() diasErro = false;
  @Input() disabled = false;
  @Output() toggleDia = new EventEmitter<number>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  readonly diasSemana = DIAS_SEMANA_UI;

  isDiaMarcado(valor: number): boolean {
    return this.diasMarcados.has(valor);
  }
}
