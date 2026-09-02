import React, { useState, useEffect } from 'react';
import { Scale, ChevronLeft, ChevronRight, Eye, EyeOff, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { STATUSES } from '../constants';
import { formatBRL } from '../utils/currency';

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

    // Hidden items state persisted per year in localStorage
    const storageKey = `hidden_annual_items_${year}`;
    const [hiddenItems, setHiddenItems] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [isManagingHidden, setIsManagingHidden] = useState(false);
    const [isIncomeCollapsed, setIsIncomeCollapsed] = useState(false);
    const [isExpenseCollapsed, setIsExpenseCollapsed] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(hiddenItems));
        } catch (e) {
            console.error('Erro ao salvar lançamentos ocultos', e);
        }
    }, [hiddenItems, storageKey]);

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

    // Filter out hidden items for display
    const visibleIncomes = sortedIncomes.filter(desc => !hiddenItems.includes(desc));
    const visibleExpenses = sortedExpenses.filter(desc => !hiddenItems.includes(desc));

    const hideItem = (desc: string) => {
        setHiddenItems(prev => [...prev, desc]);
    };

    const unhideItem = (desc: string) => {
        setHiddenItems(prev => prev.filter(item => item !== desc));
    };

    const restoreAllHidden = () => {
        setHiddenItems([]);
    };

    const getItemType = (desc: string): 'income' | 'expense' => {
        if (descriptionsByType.income.has(desc)) return 'income';
        return 'expense';
    };

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

    const getStatusColorClass = (status: string, _type: string) => {
        switch (status) {
            case STATUSES.PAID: return 'text-green-600 dark:text-green-400 font-bold';
            case STATUSES.CONFIRMED: return 'text-yellow-600 dark:text-yellow-500 font-bold';
            case STATUSES.WAITING: return 'text-red-600 dark:text-red-400 font-bold';
            default: return 'text-slate-600 dark:text-slate-400';
        }
    };

    const getStatusBgClass = (status: string, _type: string) => {
        switch (status) {
            case STATUSES.PAID: return 'bg-green-50 dark:bg-green-500/10';
            case STATUSES.CONFIRMED: return 'bg-yellow-50 dark:bg-yellow-500/10';
            case STATUSES.WAITING: return 'bg-red-50 dark:bg-red-500/10';
            default: return '';
        }
    };

    return (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header Controls */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-wrap gap-2 justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                        <Scale size={18} className="text-cyan-500" /> Detalhamento Anual por Lançamento {year}
                    </h3>

                    {hiddenItems.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setIsManagingHidden(!isManagingHidden)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition shadow-sm cursor-pointer"
                            title="Gerenciar lançamentos ocultos"
                        >
                            <EyeOff size={13} />
                            <span>{hiddenItems.length} Ocultado{hiddenItems.length > 1 ? 's' : ''}</span>
                            <ChevronDown size={13} className={`transition-transform duration-200 ${isManagingHidden ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {hiddenItems.length > 0 && (
                        <button
                            type="button"
                            onClick={restoreAllHidden}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                            title="Exibir todos os lançamentos ocultos"
                        >
                            <RotateCcw size={12} />
                            <span>Exibir Todos</span>
                        </button>
                    )}
                    <div className="flex gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                        <button onClick={() => scroll('left')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition text-slate-500" title="Rolar para esquerda"><ChevronLeft size={16} /></button>
                        <button onClick={() => scroll('right')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition text-slate-500" title="Rolar para direita"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Hidden Items Management Banner/Drawer */}
            {isManagingHidden && hiddenItems.length > 0 && (
                <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/40 animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                            <EyeOff size={14} /> Lançamentos Ocultados (Clique para reexibir na tabela):
                        </span>
                        <button 
                            type="button"
                            onClick={restoreAllHidden} 
                            className="text-xs font-extrabold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            <RotateCcw size={12} /> Restaurar Todos
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto custom-scrollbar p-1">
                        {hiddenItems.map(desc => {
                            const type = getItemType(desc);
                            const isIncome = type === 'income';
                            return (
                                <button
                                    key={desc}
                                    type="button"
                                    onClick={() => unhideItem(desc)}
                                    className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold shadow-sm transition-all border cursor-pointer ${
                                        isIncome 
                                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80' 
                                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/80'
                                    }`}
                                    title="Clique para reexibir na tabela"
                                >
                                    <span className="opacity-70 text-[10px] font-bold uppercase">{isIncome ? 'Receita' : 'Despesa'}</span>
                                    <span className="font-bold">{desc}</span>
                                    <Eye size={13} className="opacity-60 group-hover:opacity-100 transition-opacity ml-1" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div 
                ref={scrollRef}
                className="overflow-x-auto no-scrollbar"
            >
                <table className="min-w-[1200px] w-full border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                            <th className="p-3 text-left text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest sticky left-0 bg-slate-50 dark:bg-slate-900 z-10 border-r border-slate-100 dark:border-slate-700 min-w-[220px]">
                                Lançamento
                            </th>
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
                                <tr className="bg-green-50/40 dark:bg-green-500/10 border-y border-green-100 dark:border-green-900/30">
                                    <td colSpan={13} className="p-2.5 text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest pl-4 sticky left-0 bg-green-50/80 dark:bg-slate-800 z-10 border-r border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center justify-between pr-2">
                                            <div className="flex items-center gap-2">
                                                <span>Receitas</span>
                                                <span className="text-[10px] font-bold text-green-600 dark:text-green-500 bg-white/70 dark:bg-slate-900/50 px-2 py-0.5 rounded-full border border-green-200/50 dark:border-green-800/30">
                                                    {visibleIncomes.length} {visibleIncomes.length === 1 ? 'item' : 'itens'}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsIncomeCollapsed(!isIncomeCollapsed)}
                                                className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 dark:text-green-400 hover:underline cursor-pointer"
                                            >
                                                {isIncomeCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                                <span>{isIncomeCollapsed ? 'Expandir' : 'Recolher Bloco'}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {!isIncomeCollapsed && visibleIncomes.map(desc => (
                                    <tr key={desc} className="group/row border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="p-3 text-xs font-medium text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-100 dark:border-slate-700 max-w-[240px]">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="truncate font-semibold text-slate-800 dark:text-slate-200" title={desc}>{desc}</span>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        hideItem(desc);
                                                    }}
                                                    title="Ocultar este lançamento da tabela"
                                                    className="opacity-40 sm:opacity-0 sm:group-hover/row:opacity-100 focus:opacity-100 p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-all shrink-0 cursor-pointer"
                                                >
                                                    <EyeOff size={13} />
                                                </button>
                                            </div>
                                        </td>
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
                                                            {formatBRL(data.amount)}
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
                                <tr className="bg-red-50/40 dark:bg-red-500/10 border-y border-red-100 dark:border-red-900/30">
                                    <td colSpan={13} className="p-2.5 text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-widest pl-4 sticky left-0 bg-red-50/80 dark:bg-slate-800 z-10 border-r border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center justify-between pr-2">
                                            <div className="flex items-center gap-2">
                                                <span>Despesas</span>
                                                <span className="text-[10px] font-bold text-red-600 dark:text-red-500 bg-white/70 dark:bg-slate-900/50 px-2 py-0.5 rounded-full border border-red-200/50 dark:border-red-800/30">
                                                    {visibleExpenses.length} {visibleExpenses.length === 1 ? 'item' : 'itens'}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsExpenseCollapsed(!isExpenseCollapsed)}
                                                className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 dark:text-red-400 hover:underline cursor-pointer"
                                            >
                                                {isExpenseCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                                <span>{isExpenseCollapsed ? 'Expandir' : 'Recolher Bloco'}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {!isExpenseCollapsed && visibleExpenses.map(desc => (
                                    <tr key={desc} className="group/row border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="p-3 text-xs font-medium text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-100 dark:border-slate-700 max-w-[240px]">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="truncate font-semibold text-slate-800 dark:text-slate-200" title={desc}>{desc}</span>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        hideItem(desc);
                                                    }}
                                                    title="Ocultar este lançamento da tabela"
                                                    className="opacity-40 sm:opacity-0 sm:group-hover/row:opacity-100 focus:opacity-100 p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-all shrink-0 cursor-pointer"
                                                >
                                                    <EyeOff size={13} />
                                                </button>
                                            </div>
                                        </td>
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
                                                            {formatBRL(data.amount)}
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

