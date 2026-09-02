import React, { useState } from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';
import { CurrencyInput } from './CurrencyInput';
import { formatBRL } from '../utils/currency';

export const BudgetModal = ({ onClose, onSave, currentBudgets, categories, monthlyExpenses = {}, currentDate = new Date() }: any) => {
    const [budgets, setBudgets] = useState(currentBudgets);

    const handleBudgetChange = (category: string, value: number) => {
        setBudgets((prev: any) => ({ ...prev, [category]: value }));
    };

    // Calculate real-time totals
    const totalBudgets = Object.keys(budgets)
        .filter(cat => categories.expense.includes(cat))
        .reduce((sum, cat) => sum + (budgets[cat] || 0), 0);
        
    const totalSpent = Object.keys(monthlyExpenses)
        .filter(cat => categories.expense.includes(cat))
        .reduce((sum, cat) => sum + (monthlyExpenses[cat] || 0), 0);

    const formattedMonth = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const capitalizedMonth = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl animate-fade-in-up max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        Definir Orçamentos Mensais
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Configure metas de gastos para suas categorias com base na sua rotina do mês de <strong className="text-slate-700 dark:text-slate-300 font-semibold">{capitalizedMonth}</strong>.
                    </p>
                </div>

                {/* Resumo Consolidado */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100/80 dark:border-slate-700/40 shrink-0">
                    <div>
                        <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                            Soma dos Orçamentos
                        </span>
                        <div className="text-lg font-extrabold text-cyan-600 dark:text-cyan-400">
                            {formatBRL(totalBudgets)}
                        </div>
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                            Total Gasto Lançado ({capitalizedMonth})
                        </span>
                        <div className="text-lg font-extrabold text-slate-700 dark:text-slate-200">
                            {formatBRL(totalSpent)}
                        </div>
                    </div>
                </div>

                {/* Campos do Orçamento */}
                <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                    {Array.from(new Set(categories.expense as string[])).map((category: string) => {
                        const spent = monthlyExpenses[category] || 0;
                        return (
                            <div key={category} className="p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-700 transition duration-200">
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                        {category}
                                    </label>
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                        Lançado: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{formatBRL(spent)}</strong>
                                    </span>
                                </div>
                                <div className="relative flex items-center gap-2">
                                    <div className="relative flex-grow">
                                        <CurrencyInput
                                            value={budgets[category] || 0}
                                            onChange={(value) => handleBudgetChange(category, value)}
                                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200 shadow-sm transition-all"
                                        />
                                    </div>
                                    {spent > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => handleBudgetChange(category, spent)}
                                            className="px-2 py-1.5 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-950/80 rounded-lg transition-all border border-cyan-100 dark:border-cyan-900/50 flex items-center gap-1 shrink-0"
                                            title="Usar o valor total lançado neste mês para esta categoria"
                                        >
                                            <Sparkles size={11} />
                                            Usar Gasto
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-700 pt-4 shrink-0">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition">Cancelar</button>
                    <button onClick={() => onSave(budgets)} className="bg-cyan-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20 hover:bg-cyan-600 transition">Salvar</button>
                </div>
            </div>
        </div>
    );
};
