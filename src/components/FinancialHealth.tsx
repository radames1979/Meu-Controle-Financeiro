import React from 'react';
import { Activity } from 'lucide-react';
import { DENSITY_CLASSES } from '../constants';

export const FinancialHealth = ({ stats, density }: any) => {
    const { income, expense } = stats;
    const paddingClass = DENSITY_CLASSES.cardPadding[density as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-6';
    const spacingClass = DENSITY_CLASSES.spacing[density as keyof typeof DENSITY_CLASSES.spacing] || 'space-y-2';
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    
    let score = 0;
    if (savingsRate > 30) score = 100;
    else if (savingsRate > 20) score = 85;
    else if (savingsRate > 10) score = 70;
    else if (savingsRate > 0) score = 50;
    else score = 30;

    const getStatus = () => {
        if (score >= 85) return { text: 'Excelente', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' };
        if (score >= 70) return { text: 'Bom', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10' };
        if (score >= 50) return { text: 'Regular', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' };
        return { text: 'Crítico', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' };
    };

    const status = getStatus();

    return (
        <div className={`bg-white dark:bg-slate-800 ${paddingClass} rounded-xl shadow-sm border border-slate-200 dark:border-slate-700`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Activity size={20} className="text-cyan-500" /> Saúde Financeira
                </h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${status.bg} ${status.color}`}>
                    {status.text}
                </span>
            </div>
            <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                            className="text-slate-100 dark:text-slate-700 stroke-current"
                            strokeWidth="3"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className={`${status.color.replace('text', 'stroke')} stroke-current transition-all duration-1000 ease-out`}
                            strokeWidth="3"
                            strokeDasharray={`${score}, 100`}
                            strokeLinecap="round"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" className="text-[8px] font-bold fill-current text-slate-700 dark:text-slate-200" textAnchor="middle">{score}%</text>
                    </svg>
                </div>
                <div className={`flex-1 ${spacingClass}`}>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-tight">
                        Sua taxa de poupança está em <span className="font-bold text-slate-700 dark:text-slate-200">{savingsRate.toFixed(1)}%</span>. 
                        {score >= 85 ? " Você está no caminho certo!" : " Tente reduzir gastos supérfluos."}
                    </p>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${status.color.replace('text', 'bg')} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
