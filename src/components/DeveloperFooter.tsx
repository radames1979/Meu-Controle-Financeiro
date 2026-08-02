import React from 'react';
import { Code2, Mail, MessageCircle } from 'lucide-react';

interface DeveloperFooterProps {
    className?: string;
}

export const DeveloperFooter: React.FC<DeveloperFooterProps> = ({ className = '' }) => {
    const whatsappClean = '5547992126402';
    const whatsappUrl = `https://wa.me/${whatsappClean}?text=Ol%C3%A1%20Radam%C3%A9s,%20vim%20pelo%20aplicativo%20Plano%20Raiz!`;

    return (
        <footer className={`w-full py-5 px-4 md:px-6 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md transition-colors rounded-2xl ${className}`}>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                {/* Developer Branding */}
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 font-medium">
                    <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500 shrink-0 border border-cyan-100 dark:border-cyan-900/40">
                        <Code2 size={16} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 block">Atribuição &amp; Desenvolvimento</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">Desenvolvedor &amp; Programador: <strong className="text-cyan-600 dark:text-cyan-400 font-black">Radamés</strong></span>
                    </div>
                </div>

                {/* Contact Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 font-semibold">
                    {/* WhatsApp */}
                    <a 
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition shadow-xs cursor-pointer group"
                        title="Falar com Radamés no WhatsApp"
                    >
                        <MessageCircle size={15} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span>WhatsApp: <strong>(47) 99212-6402</strong></span>
                    </a>

                    {/* Email */}
                    <a 
                        href="mailto:messi@bol.com.br"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/80 transition shadow-xs cursor-pointer group"
                        title="Enviar e-mail para Radamés"
                    >
                        <Mail size={15} className="text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
                        <span>E-mail: <strong>messi@bol.com.br</strong></span>
                    </a>
                </div>
            </div>
        </footer>
    );
};
