import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Aluno } from '../types/aluno.model';
import { AlunosRepository } from '../repositories/alunos.repository';

/**
 * API pública da feature de alunos: assinaturas estáveis, sem detalhes do Supabase.
 */
@Injectable({ providedIn: 'root' })
export class AlunosService {
  private readonly repo = inject(AlunosRepository);

  listar(): Observable<Aluno[]> {
    return this.repo.listar();
  }

  obterPorId(id: string): Observable<Aluno | undefined> {
    return this.repo.obterPorId(id);
  }

  criar(aluno: Omit<Aluno, 'id'>): Observable<Aluno> {
    return this.repo.criar(aluno);
  }

  atualizar(
    id: string,
    dados: Partial<Omit<Aluno, 'id'>>
  ): Observable<Aluno | undefined> {
    return this.repo.atualizar(id, dados);
  }

  excluir(id: string): Observable<boolean> {
    return this.repo.excluir(id);
  }
}
