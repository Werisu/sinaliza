import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataAccessAlunos } from './data-access-alunos';

describe('DataAccessAlunos', () => {
  let component: DataAccessAlunos;
  let fixture: ComponentFixture<DataAccessAlunos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataAccessAlunos],
    }).compileComponents();

    fixture = TestBed.createComponent(DataAccessAlunos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
