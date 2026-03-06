import React from 'react';
import { Scale, ChevronLeft, ChevronRight } from 'lucide-react';
import { STATUSES } from '../constants';

interface AnnualComparisonCardProps {
    data: {
        incomeTotals: number[];
        expenseTotals: number[];
        monthlyTransactions: any[][];
    };
    year: number;
    density: string;
    onEdit: (t: any) => void;
    onDrillDown: (title: string, transactions: any[]) => void;
}

export const AnnualComparisonCard = ({ data, year, density, onEdit, onDrillDown }: AnnualComparisonCardProps) => {
    const { monthlyTransactions } = data;
    const months = Array.from({ length: 12 }, (_, i) => 
        new Date(year, i, 1).toLocaleString('pt-BR', { month: 'short' })
    );

    // Get all unique descriptions grouped by type
    const descriptionsByType = {
        income: new Set<string>(),
        expense: new Set<string>()
    };

    monthlyTransactions.forEach(monthList => {
        monthList.forEach(t => {
            if (t.type === 'income') descriptionsByType.income.add(t.description);
            else descriptionsByType.expense.add(t.description);
        });
    });

    const sortedIncomes = Array.from(descriptionsByType.income).sort();
    const sortedExpenses = Array.from(descriptionsByType.expense).sort();

    const scrollRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - 200 : scrollLeft + 200;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const getDataForDescription = (desc: string, monthIndex: number) => {
        const matches = monthlyTransactions[monthIndex].filter(t => t.description === desc);
        if (matches.length === 0) return null;

        const totalAmount = matches.reduce((sum, t) => sum + t.amount, 0);
        
        // Determine status: if any is waiting, show waiting. If any is confirmed, show confirmed. Else paid.
        let status = STATUSES.PAID;
        if (matches.some(t => t.status === STATUSES.WAITING)) status = STATUSES.WAITING;
        else if (matches.some(t => t.status === STATUSES.CONFIRMED)) status = STATUSES.CONFIRMED;

        return { amount: totalAmount, status, type: matches[0].type, matches };
    };

    const handleCellClick = (data: any, monthName: string, description: string) => {
        if (!data || !data.matches || data.matches.length === 0) return;

        if (data.matches.length === 1) {
            onEdit(data.matches[0]);
        } else {
            onDrillDown(`${description} - ${monthName}`, data.matches);
        }
    };

    const getStatusColorClass = (status: string, type: string) => {
        if (type === 'income') return 'text-green-600 dark:text-green-400 font-bold';
        
        switch (status) {
            case STATUSES.PAID: return 'text-green-600 dark:text-green-400 font-bold';
            case STATUSES.CONFIRMED: return 'text-yellow-600 dark:text-yellow-500 font-bold';
            case STATUSES.WAITING: return 'text-red-600 dark:text-red-400 font-bold';
            default: return 'text-slate-600 dark:text-slate-400';
        }
    };

    const getStatusBgClass = (status: string, type: string) => {
        if (type === 'income') return '';
        
        switch (status) {
            case STATUSES.PAID: return 'bg-green-50 dark:bg-green-500/10';
            case STATUSES.CONFIRMED: return 'bg-yellow-50 dark:bg-yellow-500/10';
            case STATUSES.WAITING: return 'bg-red-50 dark:bg-red-500/10';
            default: return '';
        }
    };

    return (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                    <Scale size={18} className="text-cyan-500" /> Detalhamento Anual por Lançamento {year}
                </h3>
                <div className="flex gap-1">
                    <button onClick={() => scroll('left')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition text-slate-500"><ChevronLeft size={16} /></button>
                    <button onClick={() => scroll('right')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition text-slate-500"><ChevronRight size={16} /></button>
                </div>
            </div>

            <div 
                ref={scrollRef}
                className="overflow-x-auto no-scrollbar"
            >
                <table className="min-w-[1200px] w-full border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                            <th className="p-3 text-left text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest sticky left-0 bg-slate-50 dark:bg-slate-900 z-10 border-r border-slate-100 dark:border-slate-700">Lançamento</th>
                            {months.map((month) => (
                                <th key={month} className="p-3 text-right text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest border-r border-slate-100 dark:border-slate-700 last:border-r-0">
                                    {month}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Incomes Section */}
                        {sortedIncomes.length > 0 && (
                            <>
                                <tr className="bg-green-50/30 dark:bg-green-500/5">
                                    <td colSpan={13} className="p-2 text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest pl-4">Receitas</td>
                                </tr>
                                {sortedIncomes.map(desc => (
                                    <tr key={desc} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="p-3 text-xs font-medium text-slate-600 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-100 dark:border-slate-700 truncate max-w-[200px]">{desc}</td>
                                        {months.map((month, i) => {
                                            const data = getDataForDescription(desc, i);
                                            return (
                                                <td 
                                                    key={i} 
                                                    className={`p-3 text-right text-xs border-r border-slate-100 dark:border-slate-700 last:border-r-0 ${data ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors' : ''}`}
                                                    onClick={() => handleCellClick(data, month, desc)}
                                                >
                                                    {data ? (
                                                        <span className={`px-2 py-1 rounded-md ${getStatusColorClass(data.status, data.type)} ${getStatusBgClass(data.status, data.type)}`}>
                                                            {data.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 dark:text-slate-700">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </>
                        )}

                        {/* Expenses Section */}
                        {sortedExpenses.length > 0 && (
                            <>
                                <tr className="bg-red-50/30 dark:bg-red-500/5">
                                    <td colSpan={13} className="p-2 text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest pl-4">Despesas</td>
                                </tr>
                                {sortedExpenses.map(desc => (
                                    <tr key={desc} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="p-3 text-xs font-medium text-slate-600 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-100 dark:border-slate-700 truncate max-w-[200px]">{desc}</td>
                                        {months.map((month, i) => {
                                            const data = getDataForDescription(desc, i);
                                            return (
                                                <td 
                                                    key={i} 
                                                    className={`p-3 text-right text-xs border-r border-slate-100 dark:border-slate-700 last:border-r-0 ${data ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors' : ''}`}
                                                    onClick={() => handleCellClick(data, month, desc)}
                                                >
                                                    {data ? (
                                                        <span className={`px-2 py-1 rounded-md ${getStatusColorClass(data.status, data.type)} ${getStatusBgClass(data.status, data.type)}`}>
                                                            {data.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 dark:text-slate-700">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
