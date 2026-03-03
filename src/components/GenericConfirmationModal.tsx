import React from 'react';
import { AlertCircle, CheckCircle2, Copy, Trash2, HelpCircle } from 'lucide-react';

interface GenericConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
}

export const GenericConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'info'
}: GenericConfirmationModalProps) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <Trash2 size={24} className="text-red-500" />;
            case 'warning': return <AlertCircle size={24} className="text-amber-500" />;
            case 'success': return <CheckCircle2 size={24} className="text-green-500" />;
            case 'info': return <Copy size={24} className="text-cyan-500" />;
            default: return <HelpCircle size={24} className="text-slate-500" />;
        }
    };

    const getBgIcon = () => {
        switch (type) {
            case 'danger': return 'bg-red-100 dark:bg-red-500/10';
            case 'warning': return 'bg-amber-100 dark:bg-amber-500/10';
            case 'success': return 'bg-green-100 dark:bg-green-500/10';
            case 'info': return 'bg-cyan-100 dark:bg-cyan-500/10';
            default: return 'bg-slate-100 dark:bg-slate-500/10';
        }
    };

    const getConfirmBtnClass = () => {
        switch (type) {
            case 'danger': return 'bg-red-500 hover:bg-red-600 shadow-red-500/30';
            case 'warning': return 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30';
            case 'success': return 'bg-green-500 hover:bg-green-600 shadow-green-500/30';
            case 'info': return 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/30';
            default: return 'bg-slate-500 hover:bg-slate-600 shadow-slate-500/30';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[120] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4 mb-6">
                    <div className={`${getBgIcon()} p-3 rounded-full`}>
                        {getIcon()}
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">{title}</h3>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                    {message}
                </p>
                
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-6 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${getConfirmBtnClass()}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
