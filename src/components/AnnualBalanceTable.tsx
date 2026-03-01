import React, { useState, useEffect, useRef } from 'react';
import { Calendar, X, TrendingUp, TrendingDown } from 'lucide-react';
import { TransactionList } from './TransactionList';
import { DENSITY_CLASSES } from '../constants';

export const AnnualBalanceTable = ({ data, year, onEdit, onDelete, onStatusChange, onRepeat, density }: any) => {
    const { incomeTotals, expenseTotals, grandTotalIncome, grandTotalExpense, monthlyTransactions } = data;
    const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
    const monthNames = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1).toLocaleString('pt-BR', { month: 'short' }));
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const cellPadding = density === 'super-compact' ? 'px-1 py-1' : density === 'compact' ? 'px-2 py-2' : 'px-3 py-3';

    useEffect(() => {
        if (tableContainerRef.current) {
            const container = tableContainerRef.current;
            const previousMonthIndex = new Date().getMonth() - 1;
            const targetMonthIndex = previousMonthIndex < 0 ? 0 : previousMonthIndex;
            const targetCell = container.querySelector(`table th:nth-child(${targetMonthIndex + 2})`) as HTMLElement;
            if (targetCell) {
                const containerWidth = container.offsetWidth;
                const cellLeft = targetCell.offsetLeft;
                const cellWidth = targetCell.offsetWidth;
                const scrollPosition = cellLeft - (containerWidth / 2) + (cellWidth / 2);
                container.scrollLeft = scrollPosition;
            }
        }
    }, [data]);

    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto" ref={tableContainerRef}>
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className={`${cellPadding} text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 dark:bg-slate-800 z-10`}>Descrição</th>
                            {monthNames.map((name, i) => (
                                <th 
                                    key={name} 
                                    onClick={() => setExpandedMonth(expandedMonth === i ? null : i)}
                                    className={`${cellPadding} text-right text-xs font-medium uppercase tracking-wider capitalize cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${expandedMonth === i ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    {name}
                                    <div className="text-[10px] font-normal lowercase">{expandedMonth === i ? 'ocultar' : 'ver detalhes'}</div>
                                </th>
                            ))}
                            <th className={`${cellPadding} text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider`}>Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        <tr>
                            <td className={`${cellPadding} whitespace-nowrap font-medium text-slate-900 dark:text-slate-100 sticky left-0 bg-white dark:bg-slate-800 z-10`}>Receitas</td>
                            {incomeTotals.map((total: any, i: number) => (
                                <td key={i} className={`${cellPadding} text-right text-green-600 dark:text-green-400 ${expandedMonth === i ? 'bg-cyan-50/30 dark:bg-cyan-500/5' : ''}`}>
                                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                            ))}
                            <td className={`${cellPadding} text-right font-bold text-green-700 dark:text-green-500`}>
                                {grandTotalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                        </tr>
                        <tr>
                            <td className={`${cellPadding} whitespace-nowrap font-medium text-slate-900 dark:text-slate-100 sticky left-0 bg-white dark:bg-slate-800 z-10`}>Despesas</td>
                            {expenseTotals.map((total: any, i: number) => (
                                <td key={i} className={`${cellPadding} text-right text-red-600 dark:text-red-400 ${expandedMonth === i ? 'bg-cyan-50/30 dark:bg-cyan-500/5' : ''}`}>
                                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                            ))}
                            <td className={`${cellPadding} text-right font-bold text-red-700 dark:text-red-500`}>
                                {grandTotalExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot className="bg-slate-100 dark:bg-slate-700/50">
                        <tr>
                            <td className={`${cellPadding} text-left font-bold text-slate-700 dark:text-slate-200 sticky left-0 bg-slate-100 dark:bg-slate-700 z-10`}>Balanço</td>
                            {incomeTotals.map((inc: any, i: number) => { 
                                const balance = inc - expenseTotals[i]; 
                                return (
                                    <td key={i} className={`${cellPadding} text-right font-bold ${expandedMonth === i ? 'bg-cyan-50/50 dark:bg-cyan-500/10' : ''} ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                        {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                ); 
                            })}
                            <td className={`${cellPadding} text-right font-bold ${(grandTotalIncome - grandTotalExpense) >= 0 ? 'text-blue-700 dark:text-blue-500' : 'text-orange-700 dark:text-orange-500'}`}>
                                {(grandTotalIncome - grandTotalExpense).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {expandedMonth !== null && (
                <div className="p-6 bg-slate-50 dark:bg-slate-900/20 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <Calendar size={20} className="text-cyan-500" /> 
                            Detalhes de {new Date(year, expandedMonth, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h4>
                        <button 
                            onClick={() => setExpandedMonth(null)}
                            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h5 className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <TrendingUp size={16} /> Receitas
                            </h5>
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <TransactionList 
                                    transactions={monthlyTransactions[expandedMonth].filter(t => t.type === 'income')} 
                                    onEdit={onEdit} 
                                    onDelete={onDelete}
                                    onStatusChange={onStatusChange} 
                                    onRepeat={onRepeat}
                                    density={density}
                                />
                            </div>
                        </div>
                        <div>
                            <h5 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <TrendingDown size={16} /> Despesas
                            </h5>
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <TransactionList 
                                    transactions={monthlyTransactions[expandedMonth].filter(t => t.type === 'expense')} 
                                    onEdit={onEdit} 
                                    onDelete={onDelete}
                                    onStatusChange={onStatusChange} 
                                    onRepeat={onRepeat}
                                    density={density}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
