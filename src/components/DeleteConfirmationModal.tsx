import React from 'react';

export const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, transaction }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Confirmar Exclusão</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">Deseja excluir esta transação? Esta ação não pode ser desfeita.</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition">Cancelar</button>
                    <button onClick={() => onConfirm(transaction, 'single')} className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-red-200 dark:shadow-red-900/20 hover:bg-red-600 transition">Excluir</button>
                </div>
            </div>
        </div>
    );
};
