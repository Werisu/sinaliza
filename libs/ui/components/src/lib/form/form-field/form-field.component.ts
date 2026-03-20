import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'librasflow-form-field',
  standalone: true,
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
})
export class FormFieldComponent {
  @Input() label = '';
  @Input() control?: AbstractControl | null;
  @Input() errorMessage?: string;

  getErrorMessage(): string {
    const err = this.control?.errors;
    if (!err) return '';
    if (err['required']) return 'Campo obrigatório';
    if (err['minlength']) return `Mínimo ${err['minlength'].requiredLength} caracteres`;
    if (err['maxlength']) return `Máximo ${err['maxlength'].requiredLength} caracteres`;
    return 'Valor inválido';
  }
}
