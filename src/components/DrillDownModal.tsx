import React from 'react';
import { X } from 'lucide-react';
import { TransactionList } from './TransactionList';
import { DENSITY_CLASSES } from '../constants';

export const DrillDownModal = ({ isOpen, onClose, title, transactions, onEdit, onDelete, onStatusChange, onRepeat, density }: any) => {
    if (!isOpen) return null;
    const paddingClass = DENSITY_CLASSES.cardPadding[density as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-6';
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
            <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ${paddingClass} w-full max-w-2xl animate-fade-in-up max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700`}>
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition text-slate-500 dark:text-slate-400"><X size={20} /></button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                    <TransactionList transactions={transactions} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} onRepeat={onRepeat} density={density} />
                </div>
                <div className="mt-6 flex justify-end border-t border-slate-100 dark:border-slate-700 pt-4">
                    <button type="button" onClick={onClose} className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2 px-6 rounded-xl transition">Fechar</button>
                </div>
            </div>
        </div>
    );
};
