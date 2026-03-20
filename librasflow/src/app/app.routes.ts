import { Route } from '@angular/router';
import { MainLayoutComponent } from '@sinaliza/ui-components';
import { FeatureHome } from '@sinaliza/feature-home';
import {
  AlunosListPageComponent,
  AlunosFormPageComponent,
} from '@sinaliza/feature-alunos';
import {
  AgendaListPageComponent,
  AgendaFormPageComponent,
} from '@sinaliza/feature-agenda';

export const appRoutes: Route[] = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: FeatureHome },
      { path: 'alunos', component: AlunosListPageComponent },
      { path: 'alunos/novo', component: AlunosFormPageComponent },
      { path: 'alunos/:id/editar', component: AlunosFormPageComponent },
      { path: 'agenda', component: AgendaListPageComponent },
      { path: 'agenda/novo', component: AgendaFormPageComponent },
    ],
  },
];
