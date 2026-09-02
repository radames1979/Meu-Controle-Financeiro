import React, { useState, useEffect } from 'react';
import { formatBRL } from '../utils/currency';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
    value: number | string;
    onChange: (value: number) => void;
}

// Campo de valor no padrão "R$ 0,00": digita-se da direita pra esquerda (como em
// maquininhas/apps bancários), sempre formatado com separador de milhar e vírgula
// decimal -- nunca um <input type="number"> cru com ponto decimal.
export const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, className, ...rest }) => {
    const [cents, setCents] = useState(() => Math.round((Number(value) || 0) * 100));

    useEffect(() => {
        setCents(Math.round((Number(value) || 0) * 100));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digitsOnly = e.target.value.replace(/\D/g, '');
        const newCents = digitsOnly ? parseInt(digitsOnly, 10) : 0;
        setCents(newCents);
        onChange(newCents / 100);
    };

    return (
        <input
            type="text"
            inputMode="numeric"
            value={formatBRL(cents / 100)}
            onChange={handleChange}
            className={className}
            {...rest}
        />
    );
};
