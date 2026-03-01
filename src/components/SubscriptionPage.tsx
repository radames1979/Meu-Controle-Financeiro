import React from 'react';
import { DollarSign, LogOut, Star, Copy, CheckCircle, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const SubscriptionPage = ({ user, onSubscribe, onLogout, config }: { user: any, onSubscribe: any, onLogout: any, config: any }) => {
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center p-4 transition-colors duration-300">
            <header className="w-full max-w-5xl mx-auto py-4 flex justify-between items-center">
                 <h1 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center"><DollarSign className="mr-2 text-cyan-500" /> Meu Controle Financeiro</h1>
                 <button onClick={onLogout} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-red-500 font-semibold transition">
                     Sair <LogOut size={16} />
                 </button>
            </header>
            <main className="flex-grow flex flex-col justify-center items-center text-center">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl border border-slate-200 dark:border-slate-700">
                    <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Ative seu Acesso</h2>
                    <p className="mt-4 text-slate-600 dark:text-slate-400">
                        Para liberar seu painel financeiro vitalício, realize o pagamento único via PIX. A liberação é processada pelo administrador.
                    </p>
                    
                    <div className="mt-8 bg-cyan-50 dark:bg-cyan-500/10 border-2 border-cyan-500 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider text-sm">Acesso Vitalício</h3>
                        <p className="text-5xl font-extrabold text-slate-800 dark:text-slate-100 my-4">R$ {config.defaultPrice.toFixed(2).replace('.', ',')}</p>
                        
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-cyan-100 dark:border-cyan-900/30 mb-6 flex flex-col items-center">
                            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold mb-2">Chave PIX (E-mail)</p>
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 w-full justify-between">
                                <code className="text-cyan-700 dark:text-cyan-400 font-mono">{config.pixKey}</code>
                                <button onClick={() => { navigator.clipboard.writeText(config.pixKey); toast.success('Chave copiada!'); }} className="text-cyan-500 hover:text-cyan-600 transition-colors"><Copy size={18} /></button>
                            </div>
                        </div>

                        <ul className="text-left space-y-3 text-slate-600 dark:text-slate-400 mb-8">
                            <li className="flex items-center gap-2 text-sm"><CheckCircle size={18} className="text-emerald-500" /> Sem mensalidades, pagamento único</li>
                            <li className="flex items-center gap-2 text-sm"><CheckCircle size={18} className="text-emerald-500" /> Acesso total a gráficos e relatórios</li>
                        </ul>

                        <div className="grid grid-cols-1 gap-4">
                            <button onClick={onLogout} className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-md">
                                <LogOut size={20} /> Sair e aguardar liberação
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-2">
                        <p className="text-xs text-slate-400 dark:text-slate-500">Dúvidas? Suporte rápido:</p>
                        <div className="flex gap-4">
                            <a href={`https://wa.me/${config.supportWhatsapp}`} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline text-sm flex items-center gap-1 font-bold"><Check size={14} /> WhatsApp {config.supportWhatsapp}</a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
