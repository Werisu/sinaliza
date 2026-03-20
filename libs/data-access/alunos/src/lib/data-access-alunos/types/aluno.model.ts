/**
 * Tipos de aula disponíveis.
 */
export type TipoAula = 'presencial' | 'online' | 'semipresencial';

/**
 * Níveis de proficiência.
 */
export type Nivel = 'básico' | 'intermediário' | 'avançado';

/**
 * Modelo de Aluno para o LibrasFlow.
 */
export interface Aluno {
  id: string;
  nome: string;
  telefone: string;
  tipoAula: TipoAula;
  nivel: Nivel;
  observacoes: string;
}
