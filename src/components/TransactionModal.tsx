import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { STATUSES, ACCOUNT_TYPES } from '../constants';

export const TransactionModal = ({ onClose, onSave, transaction, categories }: any) => {
    const [type, setType] = useState(transaction?.type || 'expense');
    const [amount, setAmount] = useState(transaction?.amount || '');
    const [description, setDescription] = useState(transaction?.description || '');
    const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState(transaction?.category || categories.expense[0]);
    const [account, setAccount] = useState(transaction?.account || ACCOUNT_TYPES[0]);
    const [status, setStatus] = useState(transaction?.status || STATUSES.WAITING);
    const [error, setError] = useState('');
    const [paymentCodeType, setPaymentCodeType] = useState(transaction?.paymentCodeType || 'Nenhum');
    const [paymentCode, setPaymentCode] = useState(transaction?.paymentCode || '');
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState('monthly');
    const [recurrences, setRecurrences] = useState(12);
    const isEditing = !!transaction?.id;

    useEffect(() => {
        if (!isEditing) {
            setCategory(type === 'expense' ? categories.expense[0] : categories.income[0]);
        }
    }, [type, isEditing, categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description || !date || !category || !account) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        onSave({
            id: transaction?.id,
            type,
            amount: parseFloat(amount),
            description,
            date,
            category,
            account,
            status: type === 'expense' ? status : null,
            paymentCodeType: paymentCodeType === 'Nenhum' ? null : paymentCodeType,
            paymentCode: paymentCodeType === 'Nenhum' ? null : paymentCode,
            isRecurring,
            frequency,
            recurrences
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-fade-in-up overflow-y-auto max-h-[90vh] border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">{isEditing ? 'Editar' : 'Adicionar'} Transação</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition text-slate-500 dark:text-slate-400"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 bg-red-100 dark:bg-red-500/10 p-3 rounded-xl text-sm mb-4">{error}</p>}
                    <div className="mb-4">
                        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 px-4 rounded-lg transition text-sm font-bold ${type === 'expense' ? 'bg-white dark:bg-slate-800 shadow text-red-500' : 'text-slate-500'}`} disabled={isEditing}>Despesa</button>
                            <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 px-4 rounded-lg transition text-sm font-bold ${type === 'income' ? 'bg-white dark:bg-slate-800 shadow text-green-500' : 'text-slate-500'}`} disabled={isEditing}>Receita</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Descrição</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:text-slate-200 p-3" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Valor (R$)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" min="0" className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:text-slate-200 p-3" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Data de Vencimento</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:text-slate-200 p-3" required />
                        </div>
                        {type === 'expense' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value)} className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:text-slate-200 p-3">
                                    <option value={STATUSES.WAITING}>Aguardando</option>
                                    <option value={STATUSES.CONFIRMED}>Confirmado</option>
                                    <option value={STATUSES.PAID}>Pago</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Centro de Custo</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:text-slate-200 p-3">
                                {Array.from(new Set(categories[type as keyof typeof categories] as string[])).map((c: string) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition">Cancelar</button>
                        <button type="submit" className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
