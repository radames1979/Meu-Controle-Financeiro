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
            {/* Hero Summary Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                <div className={`${heroPaddingClass} flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50`}>
                    <div className="w-full md:w-auto">
                        <h2 className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-2">Balanço Total do Mês</h2>
                        <div className="flex items-baseline gap-2 overflow-hidden">
                            <span className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter truncate">
                                {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                        <p className="mt-4 text-slate-500 dark:text-slate-400 text-xs md:text-sm flex flex-wrap items-center gap-2">
                            {balance >= 0 ? (
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                                    <TrendingUp size={14} /> Superávit
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded">
                                    <TrendingDown size={14} /> Déficit
                                </span>
                            )}
                            em relação às suas finanças.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                        <div className={`bg-emerald-500/10 ${paddingClass} rounded-2xl border border-emerald-500/20`}>
                            <p className="text-emerald-700 dark:text-emerald-400 text-[10px] md:text-xs font-bold uppercase mb-1">Entradas</p>
                            <p className="text-xl md:text-2xl font-black text-emerald-700 dark:text-emerald-400">
                                {income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                        <div className={`bg-rose-500/10 ${paddingClass} rounded-2xl border border-rose-500/20`}>
                            <p className="text-rose-700 dark:text-rose-400 text-[10px] md:text-xs font-bold uppercase mb-1">Saídas</p>
                            <p className="text-xl md:text-2xl font-black text-rose-700 dark:text-rose-400">
                                {expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-slate-100 dark:border-slate-700">
                    <div className={`${paddingClass} flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-700 last:border-r-0`}>
                        <div className="bg-slate-100 dark:bg-slate-700 p-2 md:p-3 rounded-xl text-slate-600 dark:text-slate-300">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Pago / Recebido</p>
                            <p className="text-sm md:text-lg font-bold text-slate-700 dark:text-slate-200">{paid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    </div>
                    <div className={`${paddingClass} flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-700 last:border-r-0`}>
                        <div className="bg-slate-100 dark:bg-slate-700 p-2 md:p-3 rounded-xl text-slate-600 dark:text-slate-300">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Confirmado</p>
                            <p className="text-sm md:text-lg font-bold text-slate-700 dark:text-slate-200">{confirmed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    </div>
                    <div className={`${paddingClass} flex items-center gap-4 border-slate-100 dark:border-slate-700 last:border-r-0`}>
                        <div className="bg-slate-100 dark:bg-slate-700 p-2 md:p-3 rounded-xl text-slate-600 dark:text-slate-300">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Aguardando</p>
                            <p className="text-sm md:text-lg font-bold text-slate-700 dark:text-slate-200">{waiting.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors duration-300">
                    <div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold uppercase tracking-wider">Taxa de Poupança</h3>
                        <p className={`text-2xl md:text-3xl font-black mt-1 ${savingsRate >= 20 ? 'text-emerald-600 dark:text-emerald-400' : savingsRate >= 0 ? 'text-cyan-600 dark:text-cyan-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {savingsRate.toFixed(1)}%
                        </p>
                        <p className="text-[10px] md:text-xs text-slate-400 mt-2">Percentual da receita que sobra após despesas.</p>
                    </div>
                    <div className={`p-3 md:p-4 rounded-2xl ${savingsRate >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                        <PiggyBank size={28} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors duration-300">
                    <div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold uppercase tracking-wider">Status da Licença</h3>
                        <p className="text-2xl md:text-3xl font-black mt-1 text-slate-800 dark:text-slate-200 capitalize">
                            {userProfile?.licenseStatus === 'active' ? 'Ativa' : 'Pendente'}
                        </p>
                        <p className="text-[10px] md:text-xs text-slate-400 mt-2">Acesso vitalício ao sistema financeiro.</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 p-3 md:p-4 rounded-2xl text-slate-400 dark:text-slate-300">
                        <Shield size={28} />
                    </div>
                </div>
            </div>
        </div>
    );
};
