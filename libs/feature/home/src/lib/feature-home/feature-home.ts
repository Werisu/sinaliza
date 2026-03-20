import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-feature-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './feature-home.html',
  styleUrl: './feature-home.css',
})
export class FeatureHome {
  readonly hojeLongo = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}
