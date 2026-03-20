import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MensalidadeStatus } from '@sinaliza/data-access-financeiro';
import { Aluno } from '@sinaliza/data-access-alunos';
import { ButtonComponent, FormFieldComponent } from '@sinaliza/ui-components';

@Component({
  selector: 'librasflow-finance-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, ButtonComponent],
  templateUrl: './finance-form.component.html',
  styleUrl: './finance-form.component.css',
})
export class FinanceFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() alunos: Aluno[] = [];
  @Input() isEdit = false;
  @Input() alunoNomeFixo = '';
  @Input() competenciaFixaLabel = '';
  @Input() disabled = false;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() alunoChange = new EventEmitter<string>();

  readonly statusOpcoes: MensalidadeStatus[] = ['pendente', 'pago'];

  onAlunoSelectChange(): void {
    const id = this.form.get('alunoId')?.value as string;
    this.alunoChange.emit(id ?? '');
  }
}
