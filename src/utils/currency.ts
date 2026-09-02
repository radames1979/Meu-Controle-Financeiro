export const formatBRL = (value: number | string | null | undefined): string =>
    (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
