import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, ChevronDown, ChevronUp, AlertOctagon, TrendingDown, BellRing, Search, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DENSITY_CLASSES } from '../constants';

interface BudgetAlertsWidgetProps {
    budgets: Record<string, number>;
    monthlyExpenses: Record<string, number>;
    categories: { expense: string[]; income: string[] };
    density: string;
    onDrillDown?: (category: string) => void;
    onAdjustBudget?: () => void;
}

export const BudgetAlertsWidget: React.FC<BudgetAlertsWidgetProps> = ({
    budgets = {},
    monthlyExpenses = {},
    categories,
    density,
    onDrillDown,
    onAdjustBudget
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const cardPadding = DENSITY_CLASSES.cardPadding[density as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-6';

    // Calculate details for categories that have a budget
    const alertData = useMemo(() => {
        if (!categories || !categories.expense) return [];

        return Object.keys(budgets)
            .filter(cat => budgets[cat] > 0 && categories.expense.includes(cat))
            .map(cat => {
                const spent = monthlyExpenses[cat] || 0;
                const budget = budgets[cat];
                const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                const remaining = budget - spent;
                
                return {
                    category: cat,
                    spent,
                    budget,
                    percentage,
                    remaining,
                    isCritical: percentage > 100,
                    isWarning: percentage >= 90 && percentage <= 100
                };
            })
            .filter(item => item.percentage >= 90) // Only focus on those with >= 90%
            .sort((a, b) => b.percentage - a.percentage); // Sort critical alerts first
    }, [budgets, monthlyExpenses, categories]);

    const criticalCount = alertData.filter(item => item.isCritical).length;
    const warningCount = alertData.filter(item => item.isWarning).length;
    const totalAlerts = alertData.length;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`w-full bg-white dark:bg-slate-800 rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden ${
                totalAlerts > 0 
                    ? criticalCount > 0 
                        ? 'border-rose-200 dark:border-rose-950/40 shadow-rose-100/10 dark:shadow-rose-950/5' 
                        : 'border-amber-200 dark:border-amber-950/40 shadow-amber-100/10 dark:shadow-amber-950/5'
                    : 'border-slate-200 dark:border-slate-700'
            }`}
        >
            {/* Header Area */}
            <div 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`flex items-center justify-between cursor-pointer select-none border-b border-slate-100 dark:border-slate-700/60 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50 ${cardPadding}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl flex items-center justify-center shrink-0 ${
                        totalAlerts > 0 
                            ? criticalCount > 0 
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500' 
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-500'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500'
                    }`}>
                        {totalAlerts > 0 ? (
                            criticalCount > 0 ? <AlertOctagon size={20} className="animate-bounce" /> : <AlertTriangle size={20} className="animate-pulse" />
                        ) : (
                            <CheckCircle size={20} />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            Monitor de Orçamentos
                            {totalAlerts > 0 && (
                                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                                    criticalCount > 0 
                                        ? 'bg-rose-500 text-white animate-pulse' 
                                        : 'bg-amber-500 text-white'
                                }`}>
                                    {totalAlerts} {totalAlerts === 1 ? 'alerta' : 'alertas'}
                                </span>
                            )}
                        </h3>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            {totalAlerts > 0 
                                ? `${criticalCount} estourado${criticalCount === 1 ? '' : 's'} e ${warningCount} em limite de alerta.` 
                                : 'Excelente! Todos os limites de categorias estão seguros.'}
                        </p>
                    </div>
                </div>

                <div className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                    {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </div>
            </div>

            {/* Content Area with Animation Wrapper */}
            <AnimatePresence initial={false}>
                {!isCollapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className={`${cardPadding} pt-2 space-y-4`}>
                            {totalAlerts === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col sm:flex-row items-center gap-4 py-4 px-5 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/10"
                                >
                                    <div className="bg-emerald-500/10 p-3 rounded-full text-emerald-500 shrink-0">
                                        <BellRing size={22} />
                                    </div>
                                    <div className="text-center sm:text-left space-y-1">
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Suas finanças estão protegidas!</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Nenhum centro de custo ultrapassou <span className="font-semibold text-slate-700 dark:text-slate-300">90%</span> do teto orçamentário. Você está de parabéns pela integridade financeira e contenção de saídas neste mês.
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    {alertData.map((item, index) => (
                                        <motion.div 
                                            key={item.category}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => onDrillDown && onDrillDown(item.category)}
                                            className={`p-4 rounded-xl border transition-all duration-300 bg-slate-50/50 dark:bg-slate-900/30 cursor-pointer group hover:bg-slate-100/50 dark:hover:bg-slate-900/70 p-4 ${
                                                item.isCritical 
                                                    ? 'border-rose-100 dark:border-rose-950/20 hover:border-rose-300 dark:hover:border-rose-800 shadow-sm' 
                                                    : 'border-amber-100 dark:border-amber-950/20 hover:border-amber-300 dark:hover:border-amber-800 shadow-sm'
                                            }`}
                                        >
                                            {/* Item Info row */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.isCritical ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                                                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{item.category}</span>
                                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                        item.isCritical 
                                                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' 
                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                                    }`}>
                                                        {item.isCritical ? 'Estouro Real' : 'Limite Alerta'}
                                                    </span>
                                                </div>

                                                <div className="text-right text-xs">
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">
                                                        {item.spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </span>
                                                    <span className="text-slate-400 dark:text-slate-500 mx-1">/</span>
                                                    <span className="text-slate-500 text-xs">
                                                        {item.budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Dynamic progress track */}
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden relative shadow-inner">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(item.percentage, 100)}%` }}
                                                    transition={{ duration: 1, ease: 'easeOut' }}
                                                    className={`h-full rounded-full ${item.isCritical ? 'bg-rose-500' : 'bg-amber-500'}`} 
                                                />
                                            </div>

                                            {/* Explainer & Warning messages */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] mt-2 gap-1.5">
                                                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                                                    {item.isCritical ? (
                                                        <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
                                                            <TrendingDown size={12} /> Ultrapassou em {(item.percentage - 100).toFixed(0)}% (excedeu {Math.abs(item.remaining).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                                                        </span>
                                                    ) : (
                                                        <span>
                                                            Resta apenas <span className="font-bold text-amber-600 dark:text-amber-400">{item.remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> disponíveis
                                                        </span>
                                                    )}
                                                </div>

                                                <span className={`text-[11px] font-bold tracking-tight ${item.isCritical ? 'text-rose-500' : 'text-amber-500'}`}>
                                                    {item.percentage.toFixed(0)}% Consumido
                                                </span>
                                            </div>

                                            {/* Custom descriptive dynamic advice */}
                                            <p className={`mt-2 text-[10px] leading-relaxed p-2 rounded-lg border italic ${
                                                item.isCritical 
                                                    ? 'bg-rose-500/5 dark:bg-rose-500/10 text-rose-700/90 dark:text-rose-400/90 border-rose-100/30' 
                                                    : 'bg-amber-500/5 dark:bg-amber-500/10 text-amber-700/80 dark:text-amber-400/80 border-amber-100/30'
                                            }`}>
                                                {item.isCritical 
                                                    ? `Atenção urgente: O orçamento de ${item.category} estourou. Recomenda-se cortar novos desembolsos nesta categoria até o encerramento do ciclo mensal para evitar desvio do saldo planejado.` 
                                                    : `Aviso financeiro: Você atingiu mais de 90% do seu limite de despesa em ${item.category}. Segure os gastos adicionais para não desestabilizar as metas do mês.`}
                                            </p>

                                            {/* Inline Tactile Action Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-2 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (onDrillDown) onDrillDown(item.category);
                                                    }}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all duration-200"
                                                >
                                                    <Search size={13} className="text-cyan-500" />
                                                    Ver Lançamentos
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (onAdjustBudget) onAdjustBudget();
                                                    }}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 text-xs font-bold border border-cyan-100/40 dark:border-cyan-900/40 transition-all duration-200"
                                                >
                                                    <Sliders size={13} />
                                                    Ajustar Teto
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
