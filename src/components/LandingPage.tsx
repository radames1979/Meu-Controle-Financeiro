import React, { useRef } from 'react';
import { 
    DollarSign, EyeOff, ShieldCheck, PieChart, TrendingUp, 
    Smartphone, Zap, Lock, Users, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { AuthForm } from './AuthForm';
import { DeveloperFooter } from './DeveloperFooter';
import { YOUR_CONTACT_EMAIL } from '../constants';
import { motion } from 'motion/react';

export const LandingPage = ({ onLogin, onRegister, onDemo, config }: { onLogin: any, onRegister: any, onDemo: any, config: any }) => {
    const authSectionRef = useRef<HTMLDivElement>(null);

    const scrollToAuth = () => {
        authSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-940 text-slate-800 dark:text-slate-100 selection:bg-cyan-500/30 overflow-x-hidden font-sans">
            {/* Header / Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-cyan-500 p-2 rounded-xl text-white shadow-lg shadow-cyan-200 dark:shadow-none">
                            <DollarSign size={20} />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">Plano Raiz</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-400">
                        <a href="#features" className="hover:text-cyan-500 transition">Recursos</a>
                        <a href="#security" className="hover:text-cyan-500 transition">Segurança</a>
                        <button 
                            onClick={scrollToAuth}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full hover:opacity-90 transition active:scale-95"
                        >
                            Entrar
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-400/10 dark:bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
                
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-black uppercase tracking-widest mb-6">
                            Finanças sem complicação
                        </span>
                        <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 dark:text-white leading-[1.1] mb-6 max-w-4xl mx-auto">
                            O controle financeiro que é <span className="text-cyan-500">pé no chão.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                            Não somos apenas mais um aplicativo de gastos. Somos o seu plano definitivo para sair do vermelho e construir patrimônio real.
                        </p>
                    </motion.div>
                    
                    <motion.div 
                        className="flex flex-col sm:flex-row justify-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <button 
                            onClick={scrollToAuth}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-10 rounded-2xl text-lg transition-all shadow-xl shadow-cyan-200 dark:shadow-cyan-900/20 flex items-center justify-center gap-2 active:scale-95"
                        >
                            Começar agora <ArrowRight size={20} />
                        </button>
                        <button 
                            onClick={onDemo}
                            className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold py-4 px-10 rounded-2xl text-lg transition-all hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 active:scale-95"
                        >
                            <EyeOff size={20} /> Testar Demo
                        </button>
                    </motion.div>

                    {/* App Preview Placeholder */}
                    <motion.div 
                        className="mt-20 relative max-w-5xl mx-auto"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <div className="aspect-[16/9] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 rounded-3xl border border-white/50 dark:border-slate-700 shadow-2xl overflow-hidden relative group">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="bg-white/20 backdrop-blur-lg p-6 rounded-full inline-block mb-4">
                                        <Zap className="text-white h-12 w-12" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Visualização do Sistema Plano Raiz</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Sponsors Section */}
            <section className="py-20 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-6">
                    <p className="text-center text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-12">Empresas que confiam em nosso suporte</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                        {config.sponsors && config.sponsors.map((sponsor: any, idx: number) => (
                            <img 
                                key={idx} 
                                src={sponsor.logo} 
                                alt={sponsor.name} 
                                className="h-8 md:h-10 object-contain dark:invert" 
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* FeaturesSection */}
            <section id="features" className="py-32">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Tudo o que você precisa, <span className="text-cyan-500">sem o lixo visual.</span></h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">Focamos no que importa: seu saldo, sua meta e sua paz de espírito.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { 
                                icon: <PieChart className="text-cyan-500" size={32} />, 
                                title: "Relatórios Inteligentes", 
                                desc: "Visualize exatamente para onde seu dinheiro está indo com gráficos precisos e intuitivos." 
                            },
                            { 
                                icon: <TrendingUp className="text-green-500" size={32} />, 
                                title: "Orçamentos que Funcionam", 
                                desc: "Defina limites reais por categoria e receba alertas inteligentes antes de ultrapassá-los." 
                            },
                            { 
                                icon: <Smartphone className="text-blue-500" size={32} />, 
                                title: "PWA de Alta Performance", 
                                desc: "Instale no seu iPhone ou Android e tenha a experiência de um app nativo, rápido e offline." 
                            },
                            { 
                                icon: <Lock className="text-orange-500" size={32} />, 
                                title: "Privacidade Absoluta", 
                                desc: "Seus dados financeiros não são produto. Cada conta só acessa os próprios dados, protegidos por regras de segurança e sem compartilhamento com terceiros."
                            },
                            { 
                                icon: <Zap className="text-yellow-500" size={32} />, 
                                title: "Lançamento Rápido", 
                                desc: "Interface otimizada para você lançar seus gastos em menos de 3 segundos." 
                            },
                            { 
                                icon: <Users className="text-purple-500" size={32} />, 
                                title: "Suporte Personalizado", 
                                desc: "Não é um robô. Nossa equipe está pronta para te ajudar a configurar seu plano ideal." 
                            }
                        ].map((feature, i) => (
                            <motion.div 
                                key={i}
                                className="bg-white dark:bg-slate-800 p-10 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="mb-6 bg-slate-50 dark:bg-slate-700/50 w-16 h-16 rounded-2xl flex items-center justify-center">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4 font-display">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section id="security" className="py-24 bg-slate-900 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full" />
                <div className="container mx-auto px-6 relative">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <ShieldCheck className="h-16 w-16 text-cyan-500 mb-8" />
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-8">Segurança de nível bancário no seu bolso.</h2>
                            <div className="space-y-6">
                                {[
                                    "Seus dados ficam isolados por conta, protegidos por regras de segurança no banco de dados.",
                                    "Google Firebase para autenticação segura.",
                                    "Criptografia em trânsito (HTTPS) e em repouso, padrão Google Cloud.",
                                    "Sem venda de dados para anunciantes.",
                                    "Backup automático e em tempo real."
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 text-slate-300 text-lg font-medium">
                                        <CheckCircle2 className="text-green-500 shrink-0" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:w-1/2 bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-10 rounded-3xl text-center">
                            <div className="p-4 bg-cyan-500/10 rounded-2xl inline-block mb-6">
                                <Lock className="text-cyan-400 h-10 w-10" />
                            </div>
                            <p className="text-white text-2xl font-display font-medium leading-relaxed italic mb-4">
                                "Sua liberdade financeira começa com a segurança de saber onde cada centavo está."
                            </p>
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Mantemos você seguro</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Auth Section */}
            <section ref={authSectionRef} className="py-32 bg-slate-50 dark:bg-slate-950">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-5xl md:text-6xl font-display font-bold mb-8 leading-tight">Pronto para assumir o <span className="text-cyan-500">comando?</span></h2>
                            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 font-medium">Junte-se a centenas de usuários que despertaram para uma vida financeira organizada.</p>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-3xl font-display font-bold text-cyan-500 mb-1">100%</p>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Seguro</p>
                                </div>
                                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-3xl font-display font-bold text-cyan-500 mb-1">24/7</p>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Monitorado</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800">
                             <AuthForm onLogin={onLogin} onRegister={onRegister} onDemo={onDemo} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-20 border-t border-slate-800">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-cyan-500 p-2 rounded-xl text-white">
                                <DollarSign size={20} />
                            </div>
                            <span className="font-display font-bold text-2xl tracking-tight text-white uppercase italic">Plano Raiz</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-8 font-bold text-sm uppercase tracking-widest">
                            <a href={`mailto:${YOUR_CONTACT_EMAIL}`} className="hover:text-cyan-400 transition">Contato</a>
                            <a href={`mailto:${YOUR_CONTACT_EMAIL}?subject=Quero%20ajudar`} className="hover:text-cyan-400 transition">Sugestões</a>
                            <a href={`mailto:${YOUR_CONTACT_EMAIL}?subject=Presente`} className="hover:text-cyan-400 transition">Presentear</a>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-800/50 flex flex-col items-center gap-6">
                        <DeveloperFooter className="bg-slate-800/40 border-slate-800 text-slate-300" />
                        <p className="text-xs text-slate-500 font-medium">&copy; {new Date().getFullYear()} Plano Raiz. Todos os direitos reservados. Feito para quem quer crescer.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
