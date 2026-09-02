import React, { useState } from 'react';
import { DollarSign, LogOut, Star, Copy, CheckCircle, Check, QrCode, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatBRL } from '../utils/currency';

interface PixCharge {
    paymentId: string;
    copyPaste: string;
    qrCodeImage: string;
    expirationDate: string;
    value: number;
}

export const SubscriptionPage = ({ user, onLogout, config }: { user: any, onLogout: any, config: any }) => {
    const [cpfCnpj, setCpfCnpj] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [charge, setCharge] = useState<PixCharge | null>(null);

    const handleGeneratePix = async (e: React.FormEvent) => {
        e.preventDefault();
        const digits = cpfCnpj.replace(/\D/g, '');
        if (digits.length !== 11 && digits.length !== 14) {
            toast.error('Informe um CPF ou CNPJ válido.');
            return;
        }

        setIsGenerating(true);
        try {
            const idToken = await user.getIdToken();
            const res = await fetch('/api/create-pix-charge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({ cpfCnpj: digits }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Não foi possível gerar a cobrança.');
            }
            setCharge(data);
        } catch (err: any) {
            toast.error(err.message || 'Erro ao gerar cobrança Pix. Tente o pagamento manual abaixo.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center p-4 transition-colors duration-300">
            <header className="w-full max-w-5xl mx-auto py-4 flex justify-between items-center">
                 <h1 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center"><DollarSign className="mr-2 text-cyan-500" /> Plano Raiz</h1>
                 <button onClick={onLogout} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-red-500 font-semibold transition">
                     Sair <LogOut size={16} />
                 </button>
            </header>
            <main className="flex-grow flex flex-col justify-center items-center text-center">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl border border-slate-200 dark:border-slate-700">
                    <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Ative seu Acesso</h2>
                    <p className="mt-4 text-slate-600 dark:text-slate-400">
                        Para liberar seu painel financeiro vitalício, pague uma única vez via Pix. A liberação é automática assim que o pagamento é confirmado.
                    </p>

                    <div className="mt-8 bg-cyan-50 dark:bg-cyan-500/10 border-2 border-cyan-500 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider text-sm">Acesso Vitalício</h3>
                        <p className="text-5xl font-extrabold text-slate-800 dark:text-slate-100 my-4">{formatBRL(config.defaultPrice)}</p>

                        {charge ? (
                            <div className="flex flex-col items-center gap-4">
                                <img
                                    src={`data:image/png;base64,${charge.qrCodeImage}`}
                                    alt="QR Code Pix"
                                    className="w-48 h-48 rounded-xl border border-cyan-200 dark:border-cyan-900/40 bg-white p-2"
                                />
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-cyan-100 dark:border-cyan-900/30 w-full">
                                    <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold mb-2">Pix Copia e Cola</p>
                                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 w-full justify-between">
                                        <code className="text-cyan-700 dark:text-cyan-400 font-mono text-xs truncate">{charge.copyPaste}</code>
                                        <button onClick={() => { navigator.clipboard.writeText(charge.copyPaste); toast.success('Código copiado!'); }} className="text-cyan-500 hover:text-cyan-600 transition-colors shrink-0"><Copy size={18} /></button>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Válido até {new Date(charge.expirationDate).toLocaleString('pt-BR')}. Assim que o pagamento for confirmado, seu acesso é liberado automaticamente — não é preciso recarregar a página.
                                </p>
                                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-sm font-semibold">
                                    <Loader2 size={16} className="animate-spin" /> Aguardando confirmação do pagamento...
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleGeneratePix} className="flex flex-col items-center gap-4">
                                <div className="w-full">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 text-left">CPF ou CNPJ (para emissão do Pix)</label>
                                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <CreditCard size={18} className="text-slate-400 shrink-0" />
                                        <input
                                            type="text"
                                            required
                                            value={cpfCnpj}
                                            onChange={e => setCpfCnpj(e.target.value)}
                                            placeholder="000.000.000-00"
                                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-700 dark:text-slate-200"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isGenerating}
                                    className="w-full flex items-center justify-center gap-2 bg-cyan-500 text-white py-3 rounded-xl font-bold hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-60"
                                >
                                    {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <QrCode size={20} />}
                                    {isGenerating ? 'Gerando cobrança...' : 'Gerar Pix e liberar automaticamente'}
                                </button>
                            </form>
                        )}

                        <ul className="text-left space-y-3 text-slate-600 dark:text-slate-400 mt-8">
                            <li className="flex items-center gap-2 text-sm"><CheckCircle size={18} className="text-emerald-500" /> Sem mensalidades, pagamento único</li>
                            <li className="flex items-center gap-2 text-sm"><CheckCircle size={18} className="text-emerald-500" /> Acesso total a gráficos e relatórios</li>
                        </ul>
                    </div>

                    <details className="mt-6 text-left">
                        <summary className="cursor-pointer text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Prefere pagar manualmente?</summary>
                        <div className="mt-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold mb-2">Chave PIX (E-mail)</p>
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 w-full justify-between">
                                <code className="text-cyan-700 dark:text-cyan-400 font-mono">{config.pixKey}</code>
                                <button onClick={() => { navigator.clipboard.writeText(config.pixKey); toast.success('Chave copiada!'); }} className="text-cyan-500 hover:text-cyan-600 transition-colors"><Copy size={18} /></button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Pagando dessa forma, a liberação é feita manualmente pelo suporte após a confirmação.</p>
                        </div>
                    </details>

                    <div className="mt-8 grid grid-cols-1 gap-4">
                        <button onClick={onLogout} className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-md">
                            <LogOut size={20} /> Sair e aguardar liberação
                        </button>
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
