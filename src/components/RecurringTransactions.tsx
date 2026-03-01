import React from 'react';
import { Repeat, Trash2, Calendar, ChevronRight } from 'lucide-react';
import { DENSITY_CLASSES } from '../constants';

interface RecurringTransactionsProps {
    transactions: any[];
    onDeleteRecurrence: (recurringId: string) => void;
    density: string;
}

export const RecurringTransactions = ({ transactions, onDeleteRecurrence, density }: RecurringTransactionsProps) => {
    // Agrupar transações por recurringId
    const recurringGroups = transactions.reduce((acc: any, t) => {
        if (t.recurringId) {
            if (!acc[t.recurringId]) {
                acc[t.recurringId] = [];
            }
            acc[t.recurringId].push(t);
        }
        return acc;
    }, {});

    const groups = Object.entries(recurringGroups).map(([id, items]: [string, any]) => {
        const sortedItems = [...items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const first = sortedItems[0];
        const last = sortedItems[sortedItems.length - 1];
        const totalAmount = items.reduce((sum: number, item: any) => sum + item.amount, 0);
        const paidCount = items.filter((item: any) => item.status === 'paid').length;
        
        return {
            id,
            description: first.description,
            category: first.category,
            type: first.type,
            totalAmount,
            count: items.length,
            paidCount,
            startDate: first.date,
            endDate: last.date,
            items: sortedItems
        };
    }).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    if (groups.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Repeat size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhuma recorrência ativa encontrada.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {groups.map((group) => (
                <div key={group.id} className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group overflow-hidden`}>
                    <div className={`${DENSITY_CLASSES.itemPadding[density as keyof typeof DENSITY_CLASSES.itemPadding] || 'p-4'} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${group.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                                <Repeat size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    {group.description}
                                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 uppercase tracking-wider">{group.category}</span>
                                </h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(group.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} até {new Date(group.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                                    </p>
                                    <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                                        {group.paidCount} / {group.count} parcelas
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-700">
                            <div className="text-right">
                                <p className={`text-lg font-black ${group.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {group.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Valor Total</p>
                            </div>
                            
                            <button 
                                onClick={() => onDeleteRecurrence(group.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Excluir Recorrência"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-900">
                        <div 
                            className={`h-full transition-all duration-1000 ${group.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${(group.paidCount / group.count) * 100}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
};
