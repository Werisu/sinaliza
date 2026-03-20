import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MensalidadesRepository } from '../repositories/mensalidades.repository';
import {
  MensalidadeComAluno,
  MensalidadeStatus,
  NovaMensalidade,
} from '../types/mensalidade.model';

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  private readonly repo = inject(MensalidadesRepository);

  listarPorReferenciaMes(referenciaMesPrimeiroDia: string): Observable<MensalidadeComAluno[]> {
    return this.repo.listarPorReferenciaMes(referenciaMesPrimeiroDia);
  }

  obterPorId(id: string): Observable<MensalidadeComAluno | undefined> {
    return this.repo.obterPorId(id);
  }

  criar(nova: NovaMensalidade): Observable<MensalidadeComAluno> {
    return this.repo.criar(nova);
  }

  atualizar(
    id: string,
    dados: {
      valor?: number;
      status?: MensalidadeStatus;
      dataVencimento?: string;
      observacoes?: string;
      pagoEm?: string | null;
    }
  ): Observable<MensalidadeComAluno | undefined> {
    return this.repo.atualizar(id, dados);
  }

  excluir(id: string): Observable<boolean> {
    return this.repo.excluir(id);
  }
}
