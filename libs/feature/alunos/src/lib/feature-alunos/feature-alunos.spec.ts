import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureAlunos } from './feature-alunos';

describe('FeatureAlunos', () => {
  let component: FeatureAlunos;
  let fixture: ComponentFixture<FeatureAlunos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureAlunos],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureAlunos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
