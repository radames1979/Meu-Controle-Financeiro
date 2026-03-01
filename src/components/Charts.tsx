import React, { useMemo } from 'react';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { DENSITY_CLASSES, COLORS } from '../constants';

export const Charts = ({ data, annualData, year, density, theme }: any) => {
    const paddingClass = DENSITY_CLASSES.cardPadding[density as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-6';
    const spacingClass = DENSITY_CLASSES.spacing[density as keyof typeof DENSITY_CLASSES.spacing] || 'space-y-6';
    
    const cashFlowData = useMemo(() => {
        return annualData.incomeTotals.map((income: number, i: number) => ({
            name: new Date(year, i, 1).toLocaleString('pt-BR', { month: 'short' }),
            Receitas: income,
            Despesas: annualData.expenseTotals[i],
            Saldo: income - annualData.expenseTotals[i]
        }));
    }, [annualData, year]);

    if (data.length === 0) return (<div className={`text-center text-slate-500 ${paddingClass} bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700`}><h3 className="text-lg font-semibold mb-2 dark:text-slate-200">Análise de Despesas Mensal</h3><p>Nenhuma despesa registrada neste mês para exibir gráficos.</p></div>);

    return (
        <div className={spacingClass}>
            <div className={`bg-white dark:bg-slate-800 ${paddingClass} rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[400px] overflow-hidden`}>
                <h3 className="text-lg font-bold mb-6 text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <TrendingUp size={20} className="text-cyan-500" /> Fluxo de Caixa Anual ({year})
                </h3>
                <div className="h-[300px] w-full" style={{ minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value}`} />
                            <Tooltip 
                                formatter={(value: any) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                contentStyle={{ 
                                    borderRadius: '12px', 
                                    border: 'none', 
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                                    backgroundColor: theme === 'dark' ? '#1e293b' : 'rgba(255, 255, 255, 0.9)',
                                    color: theme === 'dark' ? '#f1f5f9' : '#1e293b'
                                }}
                                itemStyle={{ color: theme === 'dark' ? '#f1f5f9' : '#1e293b' }}
                            />
                            <Legend iconType="circle" />
                            <Area type="monotone" dataKey="Receitas" stroke="#10b981" fillOpacity={1} fill="url(#colorReceitas)" strokeWidth={3} />
                            <Area type="monotone" dataKey="Despesas" stroke="#f43f5e" fillOpacity={1} fill="url(#colorDespesas)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[400px] overflow-hidden">
                    <h3 className="text-lg font-bold mb-6 text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <PieChartIcon size={20} className="text-cyan-500" /> Distribuição de Gastos
                    </h3>
                    <div className="h-[300px] w-full flex justify-center" style={{ minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie 
                                    data={data} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius="60%"
                                    outerRadius="80%" 
                                    paddingAngle={5}
                                    stroke="none"
                                >
                                    {data.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value: any) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                                        backgroundColor: theme === 'dark' ? '#1e293b' : 'rgba(255, 255, 255, 0.9)',
                                        color: theme === 'dark' ? '#f1f5f9' : '#1e293b'
                                    }}
                                />
                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
