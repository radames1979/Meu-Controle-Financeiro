import React from 'react';
import { TrendingUp, TrendingDown, CheckCircle, Clock, AlertCircle, PiggyBank, Shield } from 'lucide-react';
import { DENSITY_CLASSES } from '../constants';

export const Dashboard = ({ stats, density, userProfile }: any) => {
    const { income, balance, paid, confirmed, waiting, expense } = stats;
    const paddingClass = DENSITY_CLASSES.cardPadding[density as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-6';
    const heroPaddingClass = DENSITY_CLASSES.heroPadding[density as keyof typeof DENSITY_CLASSES.heroPadding] || 'p-6 md:p-10';
    const dashboardPaddingClass = DENSITY_CLASSES.dashboardPadding[density as keyof typeof DENSITY_CLASSES.dashboardPadding] || 'p-8';
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    return (
        <div className={`space-y-6 ${dashboardPaddingClass}`}>
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Main Balance Card - Bento Large */}
                <div className="md:col-span-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-md">
                    <div className={`${heroPaddingClass} flex flex-col justify-between h-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50`}>
                        <div>
                            <h2 className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-2">Balanço Total do Mês</h2>
                            <div className="flex items-baseline gap-2 overflow-hidden">
                                <span className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter truncate">
                                    {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        </div>
                        
                        <div className="mt-8 flex flex-col sm:flex-row items-end justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-2">
                                {balance >= 0 ? (
                                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-xl text-sm">
                                        <TrendingUp size={16} /> Superávit
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-xl text-sm">
                                        <TrendingDown size={16} /> Déficit
                                    </span>
                                )}
                                <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">em relação ao seu orçamento</span>
                            </div>
                            
                            <div className="flex gap-3 w-full sm:w-auto">
                                <div className="flex-1 sm:flex-none bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20">
                                    <p className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase">Entradas</p>
                                    <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                                        {income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                                <div className="flex-1 sm:flex-none bg-rose-500/10 px-4 py-2 rounded-2xl border border-rose-500/20">
                                    <p className="text-rose-700 dark:text-rose-400 text-[10px] font-bold uppercase">Saídas</p>
                                    <p className="text-lg font-black text-rose-700 dark:text-rose-400">
                                        {expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Savings Rate - Bento Small */}
                <div className="md:col-span-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between transition-all duration-300 hover:shadow-md">
                    <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-2xl ${savingsRate >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                            <PiggyBank size={24} />
                        </div>
                        <div className="text-right">
                            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Taxa de Poupança</h3>
                            <p className={`text-3xl font-black mt-1 ${savingsRate >= 20 ? 'text-emerald-600 dark:text-emerald-400' : savingsRate >= 0 ? 'text-cyan-600 dark:text-cyan-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {savingsRate.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-500 ${savingsRate >= 20 ? 'bg-emerald-500' : savingsRate >= 0 ? 'bg-cyan-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Percentual da receita que sobra após despesas.</p>
                    </div>
                </div>

                {/* Status Cards - Bento Row */}
                <div className="md:col-span-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-all duration-300 hover:shadow-md">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-2xl text-emerald-600 dark:text-emerald-400">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pago / Recebido</p>
                        <p className="text-lg font-black text-slate-700 dark:text-slate-200">{paid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </div>

                <div className="md:col-span-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-all duration-300 hover:shadow-md">
                    <div className="bg-yellow-50 dark:bg-yellow-500/10 p-3 rounded-2xl text-yellow-600 dark:text-yellow-400">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Confirmado</p>
                        <p className="text-lg font-black text-slate-700 dark:text-slate-200">{confirmed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </div>

                <div className="md:col-span-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-all duration-300 hover:shadow-md">
                    <div className="bg-rose-50 dark:bg-rose-500/10 p-3 rounded-2xl text-rose-600 dark:text-rose-400">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aguardando</p>
                        <p className="text-lg font-black text-slate-700 dark:text-slate-200">{waiting.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
