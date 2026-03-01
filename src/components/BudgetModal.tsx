import React, { useState } from 'react';

export const BudgetModal = ({ onClose, onSave, currentBudgets, categories }: any) => {
    const [budgets, setBudgets] = useState(currentBudgets);
    const handleBudgetChange = (category: string, value: string) => {
        setBudgets((prev: any) => ({ ...prev, [category]: parseFloat(value) || 0 }));
    };
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl animate-fade-in-up max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Definir Orçamentos</h2>
                <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from(new Set(categories.expense as string[])).map((category: string) => (
                        <div key={category}>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">{category}</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={budgets[category] || ''} 
                                onChange={(e) => handleBudgetChange(category, e.target.value)} 
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200 shadow-sm transition-all" 
                            />
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-700 pt-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition">Cancelar</button>
                    <button onClick={() => onSave(budgets)} className="bg-cyan-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20 hover:bg-cyan-600 transition">Salvar</button>
                </div>
            </div>
        </div>
    );
};
