import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AlunosService } from '@sinaliza/data-access-alunos';
import { AgendaService } from '@sinaliza/data-access-agenda';
import { FinanceiroService } from '@sinaliza/data-access-financeiro';
import { FeatureHome } from './feature-home';

describe('FeatureHome', () => {
  let component: FeatureHome;
  let fixture: ComponentFixture<FeatureHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureHome],
      providers: [
        provideRouter([]),
        { provide: AlunosService, useValue: { listar: () => of([]) } },
        { provide: AgendaService, useValue: { listarComAluno: () => of([]) } },
        {
          provide: FinanceiroService,
          useValue: { listarPorReferenciaMes: () => of([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
