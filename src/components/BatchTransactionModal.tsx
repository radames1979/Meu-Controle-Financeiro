import React, { useState } from 'react';
import { X, PlusCircle, Trash2 } from 'lucide-react';
import { ACCOUNT_TYPES } from '../constants';

export const BatchTransactionModal = ({ onClose, onSaveBatch, categories }: any) => {
    const [baseData, setBaseData] = useState({ type: 'expense', description: '', category: categories.expense[0], account: ACCOUNT_TYPES[0] });
    const [entries, setEntries] = useState([{ id: crypto.randomUUID(), monthYear: '', amount: '' }]);
    const [error, setError] = useState('');

    const handleBaseDataChange = (field: string, value: string) => {
        const newData = { ...baseData, [field]: value };
        if (field === 'type') {
            newData.category = value === 'expense' ? categories.expense[0] : categories.income[0];
        }
        setBaseData(newData);
    };

    const handleEntryChange = (id: string, field: string, value: string) => {
        setEntries(entries.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
    };

    const handleAddEntry = () => {
        const lastEntry = entries[entries.length - 1];
        let nextMonthYear = '';
        if (lastEntry && lastEntry.monthYear) {
            const [year, month] = lastEntry.monthYear.split('-').map(Number);
            const nextDate = new Date(year, month - 1, 1);
            nextDate.setMonth(nextDate.getMonth() + 1);
            nextMonthYear = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
        }
        setEntries([...entries, { id: crypto.randomUUID(), monthYear: nextMonthYear, amount: '' }]);
    };

    const handleRemoveEntry = (id: string) => {
        setEntries(entries.filter(entry => entry.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!baseData.description || !baseData.category || !baseData.account) {
            setError('Por favor, preencha todos os dados comuns.');
            return;
        }
        const areEntriesValid = entries.every(entry => entry.monthYear && Number(entry.amount) > 0);
        if (!areEntriesValid) {
            setError('Todos os lançamentos devem ter Mês/Ano e um valor maior que zero.');
            return;
        }
        const transactionsToCreate = entries.map(entry => ({ ...baseData, date: `${entry.monthYear}-01`, amount: parseFloat(entry.amount) }));
        onSaveBatch(transactionsToCreate);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl animate-fade-in-up max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">Lançamento em Lote</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition text-slate-500 dark:text-slate-400"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                    {error && <p className="text-red-500 bg-red-100 dark:bg-red-500/10 p-3 rounded-xl text-sm mb-4">{error}</p>}
                    <fieldset className="border border-slate-200 dark:border-slate-700 p-4 rounded-xl mb-6">
                        <legend className="text-sm font-bold px-2 text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dados Comuns</legend>
                        <div className="mb-4">
                            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                                <button type="button" onClick={() => handleBaseDataChange('type', 'expense')} className={`flex-1 py-2 px-4 rounded-lg transition text-sm font-bold ${baseData.type === 'expense' ? 'bg-white dark:bg-slate-800 shadow text-red-500' : 'text-slate-500'}`}>Despesa</button>
                                <button type="button" onClick={() => handleBaseDataChange('type', 'income')} className={`flex-1 py-2 px-4 rounded-lg transition text-sm font-bold ${baseData.type === 'income' ? 'bg-white dark:bg-slate-800 shadow text-green-500' : 'text-slate-500'}`}>Receita</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Descrição</label>
                                <input type="text" value={baseData.description} onChange={e => handleBaseDataChange('description', e.target.value)} className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:text-slate-200 p-2.5 text-sm" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Centro de Custo</label>
                                <select value={baseData.category} onChange={e => handleBaseDataChange('category', e.target.value)} className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:text-slate-200 p-2.5 text-sm">
                                    {Array.from(new Set(categories[baseData.type as keyof typeof categories] as string[])).map((c: string) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Tipo de Conta</label>
                                <select value={baseData.account} onChange={e => handleBaseDataChange('account', e.target.value)} className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:text-slate-200 p-2.5 text-sm">
                                    {ACCOUNT_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className="border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                        <legend className="text-sm font-bold px-2 text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lançamentos Individuais</legend>
                        <div className="space-y-3">
                            {entries.map((entry, index) => (
                                <div key={entry.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <span className="font-bold text-slate-400 dark:text-slate-600 w-6">{index + 1}</span>
                                    <div className="flex-1">
                                        <input type="month" value={entry.monthYear} onChange={e => handleEntryChange(entry.id, 'monthYear', e.target.value)} className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:text-slate-200 p-2 text-sm" required />
                                    </div>
                                    <div className="flex-1">
                                        <input type="number" value={entry.amount} onChange={e => handleEntryChange(entry.id, 'amount', e.target.value)} step="0.01" min="0.01" placeholder="Valor (R$)" className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:text-slate-200 p-2 text-sm" required />
                                    </div>
                                    <button type="button" onClick={() => handleRemoveEntry(entry.id)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-2 rounded-xl transition disabled:opacity-30" disabled={entries.length <= 1}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddEntry} className="mt-4 w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-xl transition text-sm flex items-center justify-center gap-2">
                            <PlusCircle size={18} /> Adicionar Lançamento
                        </button>
                    </fieldset>
                </form>
                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700 pt-4">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition">Cancelar</button>
                    <button type="button" onClick={handleSubmit} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]">Salvar Lote</button>
                </div>
            </div>
        </div>
    );
};
