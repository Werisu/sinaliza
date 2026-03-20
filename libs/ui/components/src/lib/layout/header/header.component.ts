import { Component, inject } from '@angular/core';
import { ThemeService } from '../../theme/theme.service';

@Component({
  selector: 'librasflow-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected readonly theme = inject(ThemeService);
}
