import React from 'react';
import { QrCode, Barcode, Repeat, ArrowUpDown, Edit, Copy, Trash2 } from 'lucide-react';
import { STATUSES, DENSITY_CLASSES } from '../constants';

export const TransactionItem = ({ transaction, onEdit, onDelete, onStatusChange, onRepeat, density }: any) => {
    const { id, type, description, date, amount, status, paymentCodeType, recurringId, installmentNumber, totalInstallments } = transaction;
    
    const itemPadding = density === 'super-compact' ? 'p-1.5' : density === 'compact' ? 'p-2' : density === 'relaxed' ? 'p-4' : density === 'super-relaxed' ? 'p-5' : 'p-3';
    const indicatorHeight = density === 'super-compact' ? 'h-6' : density === 'compact' ? 'h-8' : 'h-10';
    const textSize = density === 'super-compact' ? 'text-xs' : 'text-sm';
    const titleSize = density === 'super-compact' ? 'text-sm' : 'font-semibold text-slate-700 dark:text-slate-200';

    const getStatusIndicatorClass = (s: string) => {
        if (s === STATUSES.PAID) return 'bg-green-500';
        if (s === STATUSES.CONFIRMED) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const PaymentIcon = ({ type }: any) => {
        if (type?.includes('Pix')) return <QrCode size={14} className="text-slate-500 dark:text-slate-400" />;
        if (type === 'Código de Barras') return <Barcode size={14} className="text-slate-500 dark:text-slate-400" />;
        return null;
    };

    return (
        <li className={`flex items-center justify-between ${itemPadding} rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 last:border-b-0 group transition-all ${status === STATUSES.WAITING ? 'border-2 border-dotted border-yellow-400 dark:border-yellow-500' : ''}`}>
            <div className="flex flex-grow items-center cursor-pointer" onClick={() => onEdit(transaction)}>
                <div className={`flex-shrink-0 w-1.5 ${indicatorHeight} rounded-full mr-4 bg-slate-300 dark:bg-slate-600 relative`}>
                    {type === 'expense' && <div className={`absolute w-full h-full rounded-full ${getStatusIndicatorClass(status)}`} />}
                    {type === 'income' && <div className="absolute w-full h-full rounded-full bg-green-500" />}
                </div>
                <div>
                    <p className={`${titleSize} flex items-center gap-1`}>
                        {description}
                        {installmentNumber && totalInstallments && <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">[{installmentNumber}/{totalInstallments}]</span>}
                        <PaymentIcon type={paymentCodeType} />
                        {recurringId && <Repeat size={12} className="text-slate-500 dark:text-slate-400" />}
                    </p>
                    <p className={`${textSize} text-slate-500 dark:text-slate-400`}>
                        {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                </div>
            </div>
            <div className="flex items-center">
                <p className={`font-bold text-right mr-4 ${textSize} ${type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {type === 'income' ? '+' : '-'} {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                {type === 'expense' && (
                    <button onClick={(e) => { e.stopPropagation(); onStatusChange(id); }} className="text-slate-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 p-2 rounded-full transition" title="Alterar status">
                        <ArrowUpDown size={16} />
                    </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); onEdit(transaction); }} className="text-slate-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 p-2 rounded-full transition opacity-0 group-hover:opacity-100" title="Editar">
                    <Edit size={18} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onRepeat(transaction); }} className="text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 p-2 rounded-full transition opacity-0 group-hover:opacity-100" title="Repetir no próximo mês">
                    <Copy size={18} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(transaction); }} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-full transition opacity-0 group-hover:opacity-100" title="Excluir">
                    <Trash2 size={18} />
                </button>
            </div>
        </li>
    );
};
