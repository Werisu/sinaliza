import { formatarDataBr, formatarMesCompetenciaPt } from './financeiro-mes.util';

export function telefoneParaWaMe(telefone: string): string {
  const digits = telefone.replace(/\D/g, '');
  if (digits.length === 0) return '';
  return digits.startsWith('55') ? digits : `55${digits}`;
}

export function montarMensagemCobranca(p: {
  nomeAluno: string;
  referenciaMes: string;
  valor: number;
  dataVencimento: string;
}): string {
  const mes = formatarMesCompetenciaPt(p.referenciaMes);
  const valor = p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const venc = formatarDataBr(p.dataVencimento);
  return `Olá, ${p.nomeAluno}! Lembrete da mensalidade de ${mes} (${valor}), vencimento em ${venc}. Obrigado!`;
}

export function urlWhatsAppCobranca(telefone: string, texto: string): string | null {
  const n = telefoneParaWaMe(telefone);
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}
