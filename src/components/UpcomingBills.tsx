import React from 'react';
import { TransactionList } from './TransactionList';
import { DENSITY_CLASSES } from '../constants';

export const UpcomingBills = ({ bills, onEdit, onDelete, onStatusChange, onRepeat, density }: any) => {
    const { overdue, dueToday, dueNext7Days } = bills;
    const hasBills = overdue.length > 0 || dueToday.length > 0 || dueNext7Days.length > 0;
    const spacingClass = DENSITY_CLASSES.spacing[density as keyof typeof DENSITY_CLASSES.spacing] || 'space-y-4';
    return (
        <div>
            {!hasBills ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">Nenhuma conta a vencer.</p>
            ) : (
                <div className={spacingClass}>
                    {overdue.length > 0 && (
                        <div>
                            <h4 className="font-bold text-red-600 dark:text-red-400 mb-2 text-xs uppercase tracking-wider">Atrasadas</h4>
                            <TransactionList transactions={overdue} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} onRepeat={onRepeat} density={density} />
                        </div>
                    )}
                    {dueToday.length > 0 && (
                        <div>
                            <h4 className="font-bold text-yellow-600 dark:text-yellow-400 mb-2 text-xs uppercase tracking-wider">Vencendo Hoje</h4>
                            <TransactionList transactions={dueToday} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} onRepeat={onRepeat} density={density} />
                        </div>
                    )}
                    {dueNext7Days.length > 0 && (
                        <div>
                            <h4 className="font-bold text-cyan-600 dark:text-cyan-400 mb-2 text-xs uppercase tracking-wider">Próximos 7 Dias</h4>
                            <TransactionList transactions={dueNext7Days} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} onRepeat={onRepeat} density={density} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
