import React from 'react';
import { TransactionItem } from './TransactionItem';
import { DENSITY_CLASSES } from '../constants';

export const TransactionList = ({ transactions, onDelete, onEdit, onStatusChange, onRepeat, density }: any) => {
    const spacingClass = DENSITY_CLASSES.spacing[density as keyof typeof DENSITY_CLASSES.spacing] || 'space-y-3';
    return (
        <div className="overflow-x-auto">
            {transactions.length > 0 ? (
                <ul className={spacingClass}>
                    {transactions.map((t: any) => (
                        <TransactionItem key={t.id} transaction={t} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} onRepeat={onRepeat} density={density} />
                    ))}
                </ul>
            ) : (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">Nenhuma transação neste período.</p>
            )}
        </div>
    );
};
