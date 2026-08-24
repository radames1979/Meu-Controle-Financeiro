import React, { useRef, useState } from 'react';
import {
    DollarSign, EyeOff, ShieldCheck, PieChart, TrendingUp, TrendingDown,
    Smartphone, Zap, Lock, Users, ArrowRight, ArrowUpRight, CheckCircle2,
    Menu, X, ChevronDown, Home, Utensils, Car, Wallet
} from 'lucide-react';
import { AuthForm } from './AuthForm';
import { DeveloperFooter } from './DeveloperFooter';
import { YOUR_CONTACT_EMAIL } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_BARS = [38, 52, 44, 68, 58, 80, 64];

const HeroMockup = () => (
    <div className="relative mt-20 max-w-4xl mx-auto">
        <motion.div
            className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-700 shadow-2xl p-6 md:p-8 text-left"
            initial={{ opacity: 0, y: 40, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Meu Painel</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Agosto de 2026</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/30">
                    RS
                </div>
            </div>

            <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Saldo Total</p>
                <div className="flex items-end gap-3">
                    <p className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white">R$ 4.230,50</p>
                    <span className="flex items-center gap-1 text-emerald-500 text-sm font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full mb-1">
                        <ArrowUpRight size={14} /> 12%
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp size={12} /> Receitas</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">R$ 6.100,00</p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-500/10 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingDown size={12} /> Despesas</p>
                    <p className="text-lg font-bold text-rose-700 dark:text-rose-300">R$ 1.869,50</p>
                </div>
            </div>

            <div className="flex items-end gap-2 h-24 mb-6">
                {MOCK_BARS.map((h, i) => (
                    <motion.div
                        key={i}
                        className="flex-1 rounded-t-lg bg-gradient-to-t from-cyan-500 to-cyan-300 dark:from-cyan-600 dark:to-cyan-400"
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: 0.6 + i * 0.06, ease: 'easeOut' }}
                    />
                ))}
            </div>

            <div className="space-y-3">
                {[
                    { icon: <Home size={16} />, label: 'Aluguel', date: '01/08', value: '- R$ 1.500,00', neg: true },
                    { icon: <Utensils size={16} />, label: 'Supermercado', date: '05/08', value: '- R$ 384,90', neg: true },
                    { icon: <Car size={16} />, label: 'Salário', date: '05/08', value: '+ R$ 5.500,00', neg: false },
                ].map((t, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-700 first:border-t-0 first:pt-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300">
                                {t.icon}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t.label}</p>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">{t.date}</p>
                            </div>
                        </div>
                        <span className={`text-sm font-bold ${t.neg ? 'text-slate-600 dark:text-slate-400' : 'text-emerald-500'}`}>{t.value}</span>
                    </div>
                ))}
            </div>
        </motion.div>

        <motion.div
            className="hidden md:block absolute -top-6 -right-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-4 w-48"
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
        >
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Orçamento · Alimentação</p>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-1.5">
                <motion.div
                    className="h-full bg-amber-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '68%' }}
                    transition={{ duration: 0.8, delay: 1.3 }}
                />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">68% usado</p>
        </motion.div>

        <motion.div
            className="hidden md:flex absolute -bottom-8 -left-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-4 items-center gap-3"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.3 }}
        >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Wallet size={18} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Lançado agora</p>
                <p className="text-sm font-bold text-emerald-500">+ R$ 350,00</p>
            </div>
        </motion.div>
    </div>
);

const FAQ_ITEMS = [
    {
        q: 'Preciso pagar todo mês?',
        a: 'Não. O Plano Raiz é uma licença vitalícia com pagamento único via Pix. Você paga uma vez e usa para sempre, sem mensalidade.'
    },
    {
        q: 'Meus dados financeiros estão seguros?',
        a: 'Sim. Cada conta só acessa os próprios dados, protegidos por regras de segurança no banco de dados (Google Firebase), com autenticação por e-mail/senha, criptografia em trânsito e em repouso.'
    },
    {
        q: 'Funciona no celular?',
        a: 'Sim, é um PWA — instale no iPhone ou Android direto pelo navegador e use como um app nativo, inclusive offline.'
    },
    {
        q: 'Posso experimentar antes de pagar?',
        a: 'Sim, use o Modo Demo para explorar todas as telas com dados fictícios, sem precisar criar conta.'
    },
    {
        q: 'Como funciona o pagamento?',
        a: 'Você gera um Pix dentro do próprio app e, assim que o pagamento é confirmado, seu acesso é liberado automaticamente — sem espera.'
    },
];


export const LandingPage = ({ onLogin, onRegister, onDemo, config }: { onLogin: any, onRegister: any, onDemo: any, config: any }) => {
    const authSectionRef = useRef<HTMLDivElement>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const scrollToAuth = () => {
        setIsMobileMenuOpen(false);
        authSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToId = (id: string) => {
        setIsMobileMenuOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const hasSponsors = Array.isArray(config.sponsors) && config.sponsors.length > 0;

    return (
        <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-cyan-500/30 overflow-x-hidden font-sans">
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
                        <a href="#pricing" className="hover:text-cyan-500 transition">Preço</a>
                        <a href="#security" className="hover:text-cyan-500 transition">Segurança</a>
                        <button
                            onClick={scrollToAuth}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full hover:opacity-90 transition active:scale-95"
                        >
                            Entrar
                        </button>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(v => !v)}
                        className="md:hidden p-2 -mr-2 text-slate-700 dark:text-slate-200"
                        aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden overflow-hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
                        >
                            <div className="container mx-auto px-6 py-6 flex flex-col gap-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                <button onClick={() => scrollToId('features')} className="text-left py-3 border-b border-slate-100 dark:border-slate-800">Recursos</button>
                                <button onClick={() => scrollToId('pricing')} className="text-left py-3 border-b border-slate-100 dark:border-slate-800">Preço</button>
                                <button onClick={() => scrollToId('security')} className="text-left py-3 border-b border-slate-100 dark:border-slate-800">Segurança</button>
                                <button
                                    onClick={scrollToAuth}
                                    className="mt-4 bg-cyan-500 text-white px-6 py-3 rounded-full font-bold text-center"
                                >
                                    Entrar ou criar conta
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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

                    <HeroMockup />
                </div>
            </section>

            {/* Sponsors Section (só aparece se houver patrocinadores reais configurados) */}
            {hasSponsors && (
                <section className="py-20 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="container mx-auto px-6">
                        <p className="text-center text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-12">Empresas que confiam em nosso suporte</p>
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                            {config.sponsors.map((sponsor: any, idx: number) => (
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
            )}

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

            {/* Pricing Section */}
            <section id="pricing" className="py-32 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Um preço <span className="text-cyan-500">justo</span>, sem pegadinha.</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">Nada de assinatura escondida. Você vê o valor aqui, paga uma vez, usa para sempre.</p>
                    </div>

                    <motion.div
                        className="max-w-md mx-auto bg-slate-900 dark:bg-slate-800 rounded-3xl p-10 text-center shadow-2xl border border-slate-800"
                        whileHover={{ scale: 1.02 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-black uppercase tracking-widest mb-6">Acesso Vitalício</span>
                        <p className="text-6xl font-display font-bold text-white mb-2">
                            R$ {Number(config.defaultPrice ?? 9.99).toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-slate-400 font-medium mb-8">pagamento único via Pix</p>
                        <ul className="text-left space-y-4 mb-10">
                            {[
                                'Sem mensalidade, sem renovação',
                                'Todos os relatórios e gráficos liberados',
                                'Orçamentos, contas a vencer e recorrências',
                                'Liberação automática após o pagamento',
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-200">
                                    <CheckCircle2 className="text-cyan-400 shrink-0" size={20} />
                                    <span className="font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={scrollToAuth}
                            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 rounded-2xl text-lg transition-all shadow-lg shadow-cyan-500/30 active:scale-95"
                        >
                            Quero meu acesso
                        </button>
                    </motion.div>
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
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">— Equipe Plano Raiz</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-32 bg-slate-50 dark:bg-slate-950">
                <div className="container mx-auto px-6 max-w-3xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Perguntas <span className="text-cyan-500">frequentes.</span></h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">Se ainda ficou alguma dúvida, é só chamar no WhatsApp lá embaixo.</p>
                    </div>
                    <div>
                        {FAQ_ITEMS.map((item, i) => {
                            const isOpen = openFaq === i;
                            return (
                                <div key={i} className="border-b border-slate-200 dark:border-slate-700 py-2">
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : i)}
                                        className="w-full flex items-center justify-between gap-4 py-4 text-left"
                                    >
                                        <span className="font-bold text-slate-800 dark:text-slate-100">{item.q}</span>
                                        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 text-slate-400">
                                            <ChevronDown size={20} />
                                        </motion.span>
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="text-slate-600 dark:text-slate-400 pb-4 leading-relaxed">{item.a}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Auth Section */}
            <section ref={authSectionRef} className="py-32 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-5xl md:text-6xl font-display font-bold mb-8 leading-tight">Pronto para assumir o <span className="text-cyan-500">comando?</span></h2>
                            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 font-medium">Junte-se a centenas de usuários que despertaram para uma vida financeira organizada.</p>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-3xl font-display font-bold text-cyan-500 mb-1">100%</p>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Seguro</p>
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-3xl font-display font-bold text-cyan-500 mb-1">24/7</p>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Monitorado</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800">
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
