import React, { useRef } from 'react';
import { DollarSign, EyeOff, ShieldCheck } from 'lucide-react';
import { AuthForm } from './AuthForm';
import { YOUR_CONTACT_EMAIL } from '../constants';

export const LandingPage = ({ onLogin, onRegister, onDemo, config }: { onLogin: any, onRegister: any, onDemo: any, config: any }) => {
    const authSectionRef = useRef<HTMLDivElement>(null);

    const scrollToAuth = () => {
        authSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
            {/* Hero Section */}
            <section className="min-h-screen flex flex-col justify-center items-center text-center p-8 bg-slate-100 dark:bg-slate-800/50">
                <DollarSign className="h-16 w-16 text-cyan-500 mb-4" />
                <h1 className="text-4xl md:text-6xl font-bold text-slate-800 dark:text-slate-100">Assuma o Controle da Sua Vida Financeira</h1>
                <p className="mt-4 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl">
                    Organize suas despesas, planeje seus orçamentos e alcance suas metas com uma ferramenta simples e poderosa.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button 
                        onClick={scrollToAuth}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform duration-200 hover:scale-105 shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20"
                    >
                        Comece Agora
                    </button>
                    <button 
                        onClick={onDemo}
                        className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3 px-8 rounded-full text-lg transition-transform duration-200 hover:scale-105 shadow-md flex items-center gap-2"
                    >
                        <EyeOff size={20} /> Experimentar Demo
                    </button>
                </div>
            </section>

            {/* Sponsors Section */}
            <section className="py-16 bg-slate-100 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-2">Nossos Patrocinadores</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-10">Apoiando a educação financeira para todos.</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                        {config.sponsors && config.sponsors.map((sponsor: any, idx: number) => (
                            <img 
                                key={idx} 
                                src={sponsor.logo} 
                                alt={sponsor.name} 
                                className="h-12 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 dark:invert dark:opacity-40 dark:hover:opacity-80" 
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Auth Section */}
            <section ref={authSectionRef} className="py-20 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-6">
                    <div className="w-full max-w-md mx-auto text-center mb-12">
                         <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                         <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-100 mb-2">Segurança em Primeiro Lugar</h2>
                         <p className="text-slate-600 dark:text-slate-400">Seus dados são criptografados e jamais compartilhados. Sua privacidade é nossa prioridade.</p>
                    </div>
                    <AuthForm onLogin={onLogin} onRegister={onRegister} onDemo={onDemo} />
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-800 dark:bg-slate-950 text-slate-300 py-8">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex justify-center gap-6 mb-4">
                        <a href={`mailto:${YOUR_CONTACT_EMAIL}`} className="text-sm hover:text-cyan-400 transition">Contato & Sugestões</a>
                        <a href={`mailto:${YOUR_CONTACT_EMAIL}?subject=Quero%20presentear%20um%20amigo`} className="text-sm hover:text-cyan-400 transition">Presenteie um Amigo</a>
                    </div>
                    <p className="text-sm">&copy; {new Date().getFullYear()} Meu Controle Financeiro. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
};
