import React from 'react';
import { X, Calendar, Sparkles, Check, GitBranch, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { CHANGELOG, APP_VERSION } from '../version';

interface ChangelogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-100 dark:border-slate-800/80 overflow-hidden"
            >
                {/* Header with stylized brand accent */}
                <div className="relative p-6 border-b border-slate-100 dark:border-slate-800/70 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 shrink-0">
                            <GitBranch size={22} className="animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Linha do Tempo de Desenvolvimento</h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Acompanhe as atualizações e inovações do sistema</p>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Timeline Content */}
                <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                    <div className="relative border-l-2 border-slate-100 dark:border-slate-800 pl-6 ml-3 space-y-10">
                        {CHANGELOG.map((release, index) => {
                            const isCurrent = release.version === APP_VERSION;
                            return (
                                <div key={release.version} className="relative group">
                                    {/* Timeline Node dot */}
                                    <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 transition-transform duration-300 group-hover:scale-125 flex items-center justify-center ${
                                        isCurrent 
                                            ? 'bg-cyan-500 border-cyan-100 dark:border-cyan-900 ring-4 ring-cyan-500/10' 
                                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                                    }`}>
                                        {isCurrent && <span className="w-1 h-1 bg-white rounded-full animate-ping" />}
                                    </span>

                                    {/* Version Card & Details */}
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`text-sm font-black px-2.5 py-1 rounded-xl tracking-tight shadow-sm ${
                                                isCurrent 
                                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                            }`}>
                                                v{release.version}
                                            </span>

                                            {isCurrent && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-100/30 dark:border-cyan-900/30 uppercase tracking-wider">
                                                    <Sparkles size={10} /> Versão Ativa
                                                </span>
                                            )}

                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 dark:text-slate-500 ml-auto bg-slate-50 dark:bg-slate-950/20 px-2 py-1 rounded-lg">
                                                <Calendar size={12} /> {release.date}
                                            </span>
                                        </div>

                                        {/* Changes list formatted with custom cards */}
                                        <ul className="space-y-2 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100/80 dark:border-slate-800/40 transition-shadow duration-300 hover:shadow-inner">
                                            {release.changes.map((change, idx) => (
                                                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                                    <div className={`p-0.5 rounded-full shrink-0 mt-0.5 ${
                                                        isCurrent 
                                                            ? 'bg-cyan-50 dark:bg-cyan-950 text-cyan-500' 
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                    }`}>
                                                        <Check size={12} className="stroke-[3]" />
                                                    </div>
                                                    <span>{change}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer with helpful hint */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 text-center flex items-center justify-between px-6">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                        Organização financeira sempre atualizada.
                    </span>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                    >
                        Fechar Visualização
                        <ArrowUpRight size={14} className="opacity-70" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
