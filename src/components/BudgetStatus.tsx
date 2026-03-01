import React, { useMemo } from 'react';
import { DENSITY_CLASSES } from '../constants';

export const BudgetStatus = ({ budgets, monthlyExpenses, categories, density }: any) => {
    const spacingClass = DENSITY_CLASSES.spacing[density as keyof typeof DENSITY_CLASSES.spacing] || 'space-y-5';
    
    const budgetData = useMemo(() => {
        return Object.keys(budgets)
            .filter(cat => budgets[cat] > 0 && categories.expense.includes(cat))
            .map(cat => {
                const spent = monthlyExpenses[cat] || 0;
                const budget = budgets[cat];
                const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                let barColor = 'bg-emerald-500';
                if (percentage > 90) barColor = 'bg-rose-500';
                else if (percentage > 75) barColor = 'bg-amber-400';
                return { category: cat, spent, budget, percentage, barColor };
            });
    }, [budgets, monthlyExpenses, categories]);

    if (budgetData.length === 0) return <p className="text-center text-slate-500 dark:text-slate-400 py-8">Nenhum orçamento definido.</p>;

    return (
        <div className={spacingClass}>
            {budgetData.map(item => (
                <div key={item.category}>
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="font-bold text-slate-700 dark:text-slate-200">{item.category}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                            {item.spent.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} 
                            <span className="mx-1 text-slate-300 dark:text-slate-600">/</span> 
                            {item.budget.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className={`${item.barColor} h-full rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-end mt-1">
                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${item.percentage > 100 ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
                            {item.percentage.toFixed(0)}% Utilizado
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
