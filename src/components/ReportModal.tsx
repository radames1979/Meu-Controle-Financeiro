import React, { useState } from 'react';
import { X } from 'lucide-react';
import { STATUSES } from '../constants';

export const ReportModal = ({ onClose, onGenerate, categories }: any) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [type, setType] = useState('all');
    const [category, setCategory] = useState('all');
    const [status, setStatus] = useState('all');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-fade-in-up border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Gerar Relatório PDF</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 dark:text-slate-500 transition-colors"><X size={20} /></button>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Início</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200 shadow-sm transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Fim</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200 shadow-sm transition-all" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Tipo de Lançamento</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200 shadow-sm transition-all">
                            <option value="all">Todos os tipos</option>
                            <option value="income">Apenas Receitas</option>
                            <option value="expense">Apenas Despesas</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Categoria</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200 shadow-sm transition-all">
                            <option value="all">Todas as categorias</option>
                            {Array.from(new Set([...categories.expense, ...categories.income])).sort().map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200 shadow-sm transition-all">
                            <option value="all">Todos os status</option>
                            <option value={STATUSES.PAID}>Pago / Recebido</option>
                            <option value={STATUSES.CONFIRMED}>Confirmado</option>
                            <option value={STATUSES.WAITING}>Aguardando</option>
                        </select>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition">Cancelar</button>
                    <button 
                        onClick={() => onGenerate({ startDate, endDate, type, category, status })} 
                        className="bg-cyan-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20 hover:bg-cyan-600 transition"
                    >
                        Gerar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};
