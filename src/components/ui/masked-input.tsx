'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  formatCnpj,
  formatCpf,
  formatDateBr,
  formatPhoneBr,
} from '@/lib/validators';

export type MaskKind = 'phone-br' | 'cpf' | 'cnpj' | 'date-br';

export interface MaskedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  mask: MaskKind;
  error?: boolean;
  className?: string;
}

const FORMATTERS: Record<MaskKind, (raw: string) => string> = {
  'phone-br': formatPhoneBr,
  cpf: formatCpf,
  cnpj: formatCnpj,
  'date-br': formatDateBr,
};

const PLACEHOLDERS: Record<MaskKind, string> = {
  'phone-br': '(11) 99999-9999',
  cpf: '000.000.000-00',
  cnpj: '00.000.000/0000-00',
  'date-br': 'dd/mm/aaaa',
};

const INPUT_MODES: Record<MaskKind, React.HTMLAttributes<HTMLInputElement>['inputMode']> = {
  'phone-br': 'tel',
  cpf: 'numeric',
  cnpj: 'numeric',
  'date-br': 'numeric',
};

const MAX_LENGTHS: Record<MaskKind, number> = {
  'phone-br': 15, // (11) 99999-9999
  cpf: 14, // 000.000.000-00
  cnpj: 18, // 00.000.000/0000-00
  'date-br': 10, // dd/mm/aaaa
};

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  (
    { value, onChange, mask, error, className, placeholder, inputMode, maxLength, ...rest },
    ref
  ) => {
    const formatter = FORMATTERS[mask];

    const handleChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
      (event) => {
        const formatted = formatter(event.currentTarget.value);
        onChange(formatted);
      },
      [formatter, onChange]
    );

    return (
      <input
        ref={ref}
        value={value}
        onChange={handleChange}
        inputMode={inputMode ?? INPUT_MODES[mask]}
        maxLength={maxLength ?? MAX_LENGTHS[mask]}
        placeholder={placeholder ?? PLACEHOLDERS[mask]}
        aria-invalid={error || undefined}
        data-mask={mask}
        className={cn(
          'bg-ink-2 text-cream font-mono flex h-11 w-full border border-[var(--jb-hair)] px-4 py-2 text-base',
          'placeholder:text-fg-muted',
          'focus-visible:border-acid focus-visible:ring-acid focus-visible:ring-1 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-[180ms]',
          'aria-[invalid=true]:border-[var(--jb-fire)] aria-[invalid=true]:focus-visible:border-[var(--jb-fire)] aria-[invalid=true]:focus-visible:ring-[var(--jb-fire)]',
          className
        )}
        {...rest}
      />
    );
  }
);
MaskedInput.displayName = 'MaskedInput';

type WrapperProps = Omit<MaskedInputProps, 'mask'>;

export const MaskedPhoneInput = React.forwardRef<HTMLInputElement, WrapperProps>(
  (props, ref) => <MaskedInput ref={ref} mask="phone-br" {...props} />
);
MaskedPhoneInput.displayName = 'MaskedPhoneInput';

export const MaskedCpfInput = React.forwardRef<HTMLInputElement, WrapperProps>(
  (props, ref) => <MaskedInput ref={ref} mask="cpf" {...props} />
);
MaskedCpfInput.displayName = 'MaskedCpfInput';

export const MaskedCnpjInput = React.forwardRef<HTMLInputElement, WrapperProps>(
  (props, ref) => <MaskedInput ref={ref} mask="cnpj" {...props} />
);
MaskedCnpjInput.displayName = 'MaskedCnpjInput';

export const MaskedDateInput = React.forwardRef<HTMLInputElement, WrapperProps>(
  (props, ref) => <MaskedInput ref={ref} mask="date-br" {...props} />
);
MaskedDateInput.displayName = 'MaskedDateInput';
