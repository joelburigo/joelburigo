import { parse, isValid } from 'date-fns';
import { z } from 'zod';

export function unmask(s: string): string {
  return s.replace(/\D+/g, '');
}

export function formatPhoneBr(raw: string): string {
  const d = unmask(raw).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function formatCpf(raw: string): string {
  const d = unmask(raw).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function formatCnpj(raw: string): string {
  const d = unmask(raw).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function formatDateBr(raw: string): string {
  const d = unmask(raw).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function isAllSameDigits(s: string): boolean {
  return /^(\d)\1+$/.test(s);
}

function calcCheckDigit(digits: string, weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += Number(digits[i]) * weights[i];
  }
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
}

export function isValidCpf(value: string): boolean {
  const d = unmask(value);
  if (d.length !== 11) return false;
  if (isAllSameDigits(d)) return false;
  const w1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  const dv1 = calcCheckDigit(d.slice(0, 9), w1);
  if (dv1 !== Number(d[9])) return false;
  const dv2 = calcCheckDigit(d.slice(0, 10), w2);
  return dv2 === Number(d[10]);
}

export function isValidCnpj(value: string): boolean {
  const d = unmask(value);
  if (d.length !== 14) return false;
  if (isAllSameDigits(d)) return false;
  // Pesos CNPJ: começa em 5 e desce até 2, depois reinicia em 9 e desce até 2
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dv1 = calcCheckDigit(d.slice(0, 12), w1);
  if (dv1 !== Number(d[12])) return false;
  const dv2 = calcCheckDigit(d.slice(0, 13), w2);
  return dv2 === Number(d[13]);
}

export const phoneBrSchema = z
  .string()
  .trim()
  .regex(
    /^\(\d{2}\) \d{4,5}-\d{4}$/,
    'Telefone inválido. Use o formato (11) 99999-9999.'
  )
  .refine(
    (v) => {
      const d = unmask(v);
      return d.length === 10 || d.length === 11;
    },
    { message: 'Telefone deve ter 10 ou 11 dígitos (com DDD).' }
  );

export const cpfSchema = z
  .string()
  .trim()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido. Use 123.456.789-09.')
  .refine(isValidCpf, { message: 'CPF inválido (dígito verificador não confere).' });

export const cnpjSchema = z
  .string()
  .trim()
  .regex(
    /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    'CNPJ inválido. Use 12.345.678/0001-90.'
  )
  .refine(isValidCnpj, { message: 'CNPJ inválido (dígito verificador não confere).' });

export const dateBrSchema = z
  .string()
  .trim()
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data inválida. Use dd/mm/aaaa.')
  .refine(
    (v) => {
      const parsed = parse(v, 'dd/MM/yyyy', new Date());
      return isValid(parsed);
    },
    { message: 'Data inexistente no calendário.' }
  );

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('E-mail inválido.');
