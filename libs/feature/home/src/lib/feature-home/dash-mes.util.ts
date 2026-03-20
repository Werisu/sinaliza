/** Retorna `YYYY-MM` a partir de uma `Date` local. */
export function yyyyMmFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** `YYYY-MM` → primeiro dia do mês (ISO date). */
export function primeiroDiaMes(yyyyMm: string): string {
  return `${yyyyMm}-01`;
}

/** Mês anterior ao `YYYY-MM` indicado. */
export function yyyyMmMesAnterior(yyyyMm: string): string {
  const d = new Date(`${yyyyMm}-01T12:00:00`);
  d.setMonth(d.getMonth() - 1);
  return yyyyMmFromDate(d);
}

/** `2026-03-01` → "março de 2026" */
export function formatarMesCompetenciaPt(isoDate: string): string {
  const d = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

/** Hoje em ISO date local (yyyy-mm-dd). */
export function hojeIsoLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatarMoedaBr(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: valor % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(valor);
}
