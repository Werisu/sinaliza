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

/** `2026-03-01` → "março de 2026" */
export function formatarMesCompetenciaPt(isoDate: string): string {
  const d = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

/** `yyyy-MM-dd` → dd/MM/yyyy */
export function formatarDataBr(isoDate: string): string {
  const [y, m, day] = isoDate.slice(0, 10).split('-');
  if (!y || !m || !day) return isoDate;
  return `${day}/${m}/${y}`;
}
