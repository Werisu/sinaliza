import { Route } from '@angular/router';
import { MainLayoutComponent } from '@sinaliza/ui-components';
import { FeatureHome } from '@sinaliza/feature-home';
import { FeatureAlunos } from '@sinaliza/feature-alunos';

export const appRoutes: Route[] = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: FeatureHome },
      { path: 'alunos', component: FeatureAlunos },
    ],
  },
];
