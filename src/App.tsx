import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { PlusCircle, ArrowLeft, ArrowRight, TrendingUp, TrendingDown, DollarSign, Trash2, FileDown, FileUp, Edit, Table, CheckCircle, AlertTriangle, Clock, Layers, GripVertical, Plus, Minus, EyeOff, X, Calendar, LayoutDashboard, Barcode, Copy, QrCode, ArrowUpDown, PiggyBank, ChevronDown, Repeat, Bell, Printer, Settings, Check, ArrowUp, ArrowDown, CaseSensitive, LogOut, Mail, Lock, User, ShieldCheck, Star, HelpCircle, Menu, Gift, Search, Layout, Tags, PieChart as PieChartIcon, Activity } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, collection, writeBatch, getDocs, getDoc, query, where } from 'firebase/firestore';

// --- Configurações Iniciais ---
const YOUR_CONTACT_EMAIL = "messi@bol.com.br"; 

const INITIAL_CATEGORIES = {
    expense: ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Compras', 'Impostos', 'Empréstimos', 'Taxas bancárias', 'Outros'],
    income: ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Outros']
};

const MOCK_TRANSACTIONS = [
    { id: 'demo-1', type: 'income', description: 'Salário Mensal (Demo)', amount: 5000, category: 'Salário', date: new Date().toISOString().split('T')[0], status: 'paid' },
    { id: 'demo-2', type: 'expense', description: 'Aluguel (Demo)', amount: 1200, category: 'Moradia', date: new Date().toISOString().split('T')[0], status: 'paid' },
    { id: 'demo-3', type: 'expense', description: 'Supermercado (Demo)', amount: 450, category: 'Alimentação', date: new Date().toISOString().split('T')[0], status: 'waiting' },
    { id: 'demo-4', type: 'expense', description: 'Internet (Demo)', amount: 100, category: 'Outros', date: new Date().toISOString().split('T')[0], status: 'confirmed' },
    { id: 'demo-5', type: 'income', description: 'Freelance (Demo)', amount: 800, category: 'Freelance', date: new Date().toISOString().split('T')[0], status: 'paid' },
];

const APP_CONFIG = {
    adminEmail: 'messi@bol.com.br',
    supportEmail: 'messi@bol.com.br',
    supportWhatsapp: '47992126402',
    pixKey: 'messi@bol.com.br',
    defaultPrice: 9.99
};
const ACCOUNT_TYPES = ['Carteira', 'Conta Corrente', 'Cartão de Crédito', 'Poupança'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0', '#546E7A', '#26a69a'];
const STATUSES = {
    WAITING: 'waiting',
    CONFIRMED: 'confirmed',
    PAID: 'paid'
};
const INITIAL_WIDGET_ORDER = ['upcoming_bills', 'dashboard', 'budgets', 'charts', 'monthly_transactions', 'annual_balance', 'annual_reports'];
const SPACING_LEVELS = ['super-compact', 'compact', 'normal', 'relaxed', 'super-relaxed'];
const PAYMENT_CODE_TYPES = ['Nenhum', 'Código de Barras', 'Pix (Copia e Cola)', 'Pix (Chave Aleatória)', 'Pix (CPF/CNPJ)', 'Pix (Email)', 'Pix (Celular)'];

const DENSITY_CLASSES = {
    spacing: { 'super-compact': 'space-y-1', compact: 'space-y-2', normal: 'space-y-4', relaxed: 'space-y-6', 'super-relaxed': 'space-y-8' },
    padding: { 'super-compact': 'p-2 sm:p-3', compact: 'p-3 sm:p-4', normal: 'p-4 sm:p-6', relaxed: 'p-5 sm:p-7', 'super-relaxed': 'p-6 sm:p-8' },
    dashboardPadding: { 'super-compact': 'p-3', compact: 'p-4', normal: 'p-6', relaxed: 'p-7', 'super-relaxed': 'p-8' }
};

// --- Componente da Landing Page ---
const LandingPage = ({ onLogin, onRegister, onDemo }: { onLogin: any, onRegister: any, onDemo: any }) => {
    const authSectionRef = useRef<HTMLDivElement>(null);

    const scrollToAuth = () => {
        authSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-slate-50 text-slate-800">
            {/* Hero Section */}
            <section className="min-h-screen flex flex-col justify-center items-center text-center p-8 bg-slate-100">
                <DollarSign className="h-16 w-16 text-cyan-500 mb-4" />
                <h1 className="text-4xl md:text-6xl font-bold text-slate-800">Assuma o Controle da Sua Vida Financeira</h1>
                <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-2xl">
                    Organize suas despesas, planeje seus orçamentos e alcance suas metas com uma ferramenta simples e poderosa.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button 
                        onClick={scrollToAuth}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform duration-200 hover:scale-105 shadow-lg"
                    >
                        Comece Agora
                    </button>
                    <button 
                        onClick={onDemo}
                        className="bg-white border-2 border-slate-200 text-slate-600 font-bold py-3 px-8 rounded-full text-lg transition-transform duration-200 hover:scale-105 shadow-md flex items-center gap-2"
                    >
                        <EyeOff size={20} /> Experimentar Demo
                    </button>
                </div>
            </section>

            {/* Sponsors Section */}
            <section className="py-16 bg-slate-100">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-slate-700 mb-2">Nossos Patrocinadores</h2>
                    <p className="text-slate-500 mb-10">Apoiando a educação financeira para todos.</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                        <img src="https://placehold.co/150x60/e2e8f0/64748b?text=Patrocinador1" alt="Logo do Patrocinador 1" className="h-12" />
                        <img src="https://placehold.co/150x60/e2e8f0/64748b?text=Patrocinador2" alt="Logo do Patrocinador 2" className="h-12" />
                        <img src="https://placehold.co/150x60/e2e8f0/64748b?text=Patrocinador3" alt="Logo do Patrocinador 3" className="h-12" />
                        <img src="https://placehold.co/150x60/e2e8f0/64748b?text=Patrocinador4" alt="Logo do Patrocinador 4" className="h-12" />
                    </div>
                </div>
            </section>

            {/* Auth Section */}
            <section ref={authSectionRef} className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="w-full max-w-md mx-auto text-center mb-12">
                         <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                         <h2 className="text-3xl font-bold text-slate-700 mb-2">Segurança em Primeiro Lugar</h2>
                         <p className="text-slate-600">Seus dados são criptografados e jamais compartilhados. Sua privacidade é nossa prioridade.</p>
                    </div>
                    <AuthForm onLogin={onLogin} onRegister={onRegister} onDemo={onDemo} />
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-800 text-slate-300 py-8">
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


// --- Componente do Formulário de Autenticação ---
const AuthForm = ({ onLogin, onRegister, onDemo }: { onLogin: any, onRegister: any, onDemo: any }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await onLogin(email, password);
            } else {
                await onRegister(email, password);
            }
        } catch (err: any) {
            console.error("Erro de autenticação:", err.code, err.message);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('E-mail ou senha inválidos.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Este e-mail já está em uso.');
            } else if (err.code === 'auth/weak-password') {
                setError('A senha deve ter pelo menos 6 caracteres.');
            } else if (err.code === 'auth/operation-not-allowed') {
                setError('Erro de configuração: O login por E-mail/Senha não está ativado no Firebase.');
            } else {
                setError('Ocorreu um erro inesperado. Tente novamente.');
            }
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-2xl p-8">
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">{isLogin ? 'Acesse sua conta' : 'Crie sua conta'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center">{error}</p>}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="email"
                            placeholder="Seu e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="password"
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105"
                    >
                        {isLogin ? 'Entrar' : 'Cadastrar'}
                    </button>
                </form>

                <div className="relative py-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Ou experimente</span></div>
                </div>

                <button onClick={onDemo} className="w-full bg-slate-50 text-slate-600 py-3 rounded-lg font-bold hover:bg-slate-100 transition flex items-center justify-center gap-2 border border-slate-200">
                    <EyeOff size={18} /> Modo Demo (Visitante)
                </button>

                <p className="text-center text-sm text-slate-500 mt-6">
                    {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-semibold text-cyan-500 hover:text-cyan-600 ml-1">
                        {isLogin ? 'Cadastre-se' : 'Faça login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

// --- Componente da Página de Assinatura ---
const SubscriptionPage = ({ user, onSubscribe, onLogout, config }: { user: any, onSubscribe: any, onLogout: any, config: any }) => {
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4">
            <header className="w-full max-w-5xl mx-auto py-4 flex justify-between items-center">
                 <h1 className="text-xl font-bold text-slate-700 flex items-center"><DollarSign className="mr-2 text-cyan-500" /> Meu Controle Financeiro</h1>
                 <button onClick={onLogout} className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-500 font-semibold transition">
                     Sair <LogOut size={16} />
                 </button>
            </header>
            <main className="flex-grow flex flex-col justify-center items-center text-center">
                <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl border border-slate-200">
                    <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-slate-800">Ative seu Acesso</h2>
                    <p className="mt-4 text-slate-600">
                        Para liberar seu painel financeiro vitalício, realize o pagamento único via PIX. A liberação é processada pelo administrador.
                    </p>
                    
                    <div className="mt-8 bg-cyan-50 border-2 border-cyan-500 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-cyan-600 uppercase tracking-wider text-sm">Acesso Vitalício</h3>
                        <p className="text-5xl font-extrabold text-slate-800 my-4">R$ {config.defaultPrice.toFixed(2).replace('.', ',')}</p>
                        
                        <div className="bg-white p-4 rounded-xl border border-cyan-100 mb-6 flex flex-col items-center">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-2">Chave PIX (E-mail)</p>
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 w-full justify-between">
                                <code className="text-cyan-700 font-mono">{config.pixKey}</code>
                                <button onClick={() => { navigator.clipboard.writeText(config.pixKey); toast.success('Chave copiada!'); }} className="text-cyan-500 hover:text-cyan-600"><Copy size={18} /></button>
                            </div>
                        </div>

                        <ul className="text-left space-y-3 text-slate-600 mb-8">
                            <li className="flex items-center gap-2 text-sm"><CheckCircle size={18} className="text-emerald-500" /> Sem mensalidades, pagamento único</li>
                            <li className="flex items-center gap-2 text-sm"><CheckCircle size={18} className="text-emerald-500" /> Acesso total a gráficos e relatórios</li>
                        </ul>

                        <div className="grid grid-cols-1 gap-4">
                            <button onClick={onLogout} className="flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-200 py-3 rounded-xl font-bold hover:bg-slate-50 transition">
                                <LogOut size={20} /> Sair e aguardar liberação
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-2">
                        <p className="text-xs text-slate-400">Dúvidas? Suporte rápido:</p>
                        <div className="flex gap-4">
                            <a href={`https://wa.me/${config.supportWhatsapp}`} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline text-sm flex items-center gap-1 font-bold"><Check size={14} /> WhatsApp {config.supportWhatsapp}</a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const UserManual = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-cyan-500 text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2"><HelpCircle /> Manual do Usuário</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition"><X /></button>
                </div>
                <div className="p-8 overflow-y-auto space-y-8">
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><PlusCircle className="text-cyan-500" /> 1. Primeiros Passos</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Para começar, use o botão <strong>"Nova Transação"</strong> no topo da tela. Você pode registrar tanto Receitas (dinheiro que entra) quanto Despesas (dinheiro que sai). 
                            Escolha uma categoria e defina se o pagamento já foi realizado ou se está pendente.
                        </p>
                    </section>
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><Calendar className="text-cyan-500" /> 2. Calendário e Vencimentos</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            O widget de <strong>"Próximas Contas"</strong> mostra tudo o que vence nos próximos dias. Ative as notificações no ícone de sino para receber alertas automáticos e evitar multas.
                        </p>
                    </section>
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><PieChartIcon className="text-cyan-500" /> 3. Gráficos e Saúde Financeira</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Acompanhe sua <strong>Saúde Financeira</strong> no widget lateral. Ele calcula sua taxa de poupança mensal. Se estiver acima de 20%, você está em uma excelente posição!
                        </p>
                    </section>
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><Settings className="text-cyan-500" /> 4. Personalização</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Nas <strong>Configurações</strong>, você pode ajustar a densidade do layout (mais compacto ou mais espaçoso), gerenciar categorias e definir orçamentos mensais para cada categoria.
                        </p>
                    </section>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="bg-cyan-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-cyan-600 transition">Entendi!</button>
                </div>
            </div>
        </div>
    );
};

const AdminPanel = ({ db, onClose }: { db: any, onClose: () => void }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [whitelist, setWhitelist] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [appStats, setAppStats] = useState({ totalUsers: 0, activeLicenses: 0 });
    const [config, setConfig] = useState(APP_CONFIG);
    const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'whitelist'>('users');
    const [newWhitelistEmail, setNewWhitelistEmail] = useState('');
    const appId = 'meu-controle-financeiro';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Users from Server API (bypassing Firestore listing restrictions)
                const usersRes = await fetch('/api/admin/users');
                let usersList = [];
                if (usersRes.ok) {
                    usersList = await usersRes.json();
                }

                setUsers(usersList);
                setAppStats({
                    totalUsers: usersList.length,
                    activeLicenses: usersList.filter((u: any) => u.licenseStatus === 'active').length
                });

                // Fetch Config from Server API
                const configRes = await fetch('/api/admin/config');
                if (configRes.ok) {
                    const configData = await configRes.json();
                    setConfig(configData);
                }

                // Fetch Whitelist from Server API
                const whitelistRes = await fetch('/api/admin/whitelist');
                if (whitelistRes.ok) {
                    const whitelistData = await whitelistRes.json();
                    setWhitelist(whitelistData.emails || []);
                }
            } catch (err) {
                console.error("Erro ao buscar dados do admin:", err);
                toast.error("Erro ao acessar dados do servidor.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleToggleLicense = async (user: any) => {
        const newStatus = user.licenseStatus === 'active' ? 'pending' : 'active';
        try {
            // Update Firestore
            const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid || user.id}/profile/userProfile`);
            await updateDoc(userProfileRef, { licenseStatus: newStatus });
            
            // Update Server
            await fetch('/api/admin/users/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid || user.id, licenseStatus: newStatus })
            });
            
            setUsers(users.map(u => (u.uid === user.uid || u.id === user.id) ? { ...u, licenseStatus: newStatus } : u));
            toast.success(`Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'}`);
        } catch (err) {
            console.error("Erro ao atualizar licença:", err);
            toast.error("Erro ao atualizar licença");
        }
    };

    const handleUpdateConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                toast.success("Configurações globais salvas no servidor!");
                // Update parent state if possible
                if (typeof (window as any).setAppConfig === 'function') {
                    (window as any).setAppConfig(config);
                }
            } else {
                throw new Error();
            }
        } catch (err) {
            console.error("Erro ao salvar config:", err);
            toast.error("Erro ao salvar configurações no servidor.");
        }
    };

    const handleAddToWhitelist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWhitelistEmail) return;
        const emailLower = newWhitelistEmail.toLowerCase();
        if (whitelist.includes(emailLower)) {
            toast.error("Este e-mail já está na lista branca.");
            return;
        }
        const updatedWhitelist = [...whitelist, emailLower];
        try {
            const res = await fetch('/api/admin/whitelist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emails: updatedWhitelist })
            });
            if (res.ok) {
                setWhitelist(updatedWhitelist);
                setNewWhitelistEmail('');
                
                // Se o usuário já existir na lista, ativa ele no Firestore também
                const existingUser = users.find(u => u.email?.toLowerCase() === emailLower);
                if (existingUser && existingUser.licenseStatus !== 'active') {
                    const userProfileRef = doc(db, `artifacts/${appId}/users/${existingUser.uid || existingUser.id}/profile/userProfile`);
                    await updateDoc(userProfileRef, { licenseStatus: 'active' });
                    
                    await fetch('/api/admin/users/update-status', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ uid: existingUser.uid || existingUser.id, licenseStatus: 'active' })
                    });
                    
                    setUsers(users.map(u => u.email?.toLowerCase() === emailLower ? { ...u, licenseStatus: 'active' } : u));
                }
                
                toast.success("E-mail aprovado e liberado!");
            } else {
                throw new Error();
            }
        } catch (err) {
            console.error("Erro ao salvar whitelist:", err);
            toast.error("Erro ao atualizar lista branca no servidor.");
        }
    };

    const handleRemoveFromWhitelist = async (email: string) => {
        const updatedWhitelist = whitelist.filter(e => e !== email);
        try {
            const res = await fetch('/api/admin/whitelist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emails: updatedWhitelist })
            });
            if (res.ok) {
                setWhitelist(updatedWhitelist);
                toast.success("E-mail removido da aprovação prévia");
            } else {
                throw new Error();
            }
        } catch (err) {
            console.error("Erro ao remover da whitelist:", err);
            toast.error("Erro ao atualizar lista branca.");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Tem certeza que deseja excluir este usuário? Todos os dados serão perdidos.")) return;
        try {
            // No ambiente de artefatos, deletamos o perfil
            const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/userProfile`);
            await deleteDoc(profileRef);
            setUsers(users.filter(u => u.id !== userId));
            toast.success("Usuário removido da lista");
        } catch (err) {
            console.error("Erro ao excluir usuário:", err);
            toast.error("Erro ao excluir usuário");
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-800 text-white">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold flex items-center gap-2"><ShieldCheck /> Admin</h2>
                        <div className="flex bg-slate-700 p-1 rounded-lg">
                            <button onClick={() => setActiveTab('users')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${activeTab === 'users' ? 'bg-white text-slate-800' : 'text-slate-300 hover:text-white'}`}>Usuários</button>
                            <button onClick={() => setActiveTab('whitelist')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${activeTab === 'whitelist' ? 'bg-white text-slate-800' : 'text-slate-300 hover:text-white'}`}>Pré-Aprovar</button>
                            <button onClick={() => setActiveTab('settings')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${activeTab === 'settings' ? 'bg-white text-slate-800' : 'text-slate-300 hover:text-white'}`}>Configurações</button>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition"><X /></button>
                </div>
                
                <div className="p-8 overflow-y-auto">
                    {activeTab === 'users' ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                    <p className="text-slate-500 text-xs uppercase font-bold mb-1">Total de Usuários</p>
                                    <p className="text-3xl font-black text-slate-800">{appStats.totalUsers}</p>
                                </div>
                                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                                    <p className="text-emerald-600 text-xs uppercase font-bold mb-1">Licenças Ativas</p>
                                    <p className="text-3xl font-black text-emerald-700">{appStats.activeLicenses}</p>
                                </div>
                                <div className="bg-cyan-50 p-6 rounded-2xl border border-cyan-100">
                                    <p className="text-cyan-600 text-xs uppercase font-bold mb-1">Receita Potencial</p>
                                    <p className="text-3xl font-black text-cyan-700">R$ {(appStats.activeLicenses * config.defaultPrice).toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Usuário</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {loading ? (
                                            <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400">Carregando...</td></tr>
                                        ) : users.map((user, idx) => (
                                            <tr key={user.uid || user.id || idx} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700">{user.email}</span>
                                                        <span className="text-[10px] text-slate-400">ID: {user.uid || user.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.licenseStatus === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                        {user.licenseStatus === 'active' ? 'Ativo' : 'Pendente'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button onClick={() => handleToggleLicense(user)} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${user.licenseStatus === 'active' ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                                                        {user.licenseStatus === 'active' ? 'Desativar' : 'Ativar'}
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(user.uid || user.id)} className="text-slate-400 hover:text-rose-500 p-1.5 transition"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : activeTab === 'whitelist' ? (
                        <div className="max-w-2xl space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Pré-Aprovar E-mails</h3>
                                <p className="text-sm text-slate-500 mb-6">E-mails cadastrados aqui terão acesso liberado automaticamente assim que criarem a conta.</p>
                                <form onSubmit={handleAddToWhitelist} className="flex gap-2">
                                    <input 
                                        type="email" 
                                        required
                                        value={newWhitelistEmail}
                                        onChange={e => setNewWhitelistEmail(e.target.value)}
                                        placeholder="email@cliente.com"
                                        className="flex-1 rounded-xl border-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
                                    />
                                    <button type="submit" className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-600 transition flex items-center gap-2">
                                        <Plus size={20} /> Aprovar
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">E-mail Pré-Aprovado</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {whitelist.length === 0 ? (
                                            <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-400">Nenhum e-mail na lista branca.</td></tr>
                                        ) : whitelist.map((email, idx) => (
                                            <tr key={`${email}-${idx}`} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-700">{email}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleRemoveFromWhitelist(email)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateConfig} className="max-w-2xl space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preço da Licença (R$)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={config.defaultPrice} 
                                        onChange={e => setConfig({ ...config, defaultPrice: parseFloat(e.target.value) })}
                                        className="w-full rounded-xl border-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Chave PIX</label>
                                    <input 
                                        type="text" 
                                        value={config.pixKey} 
                                        onChange={e => setConfig({ ...config, pixKey: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">E-mail de Suporte</label>
                                    <input 
                                        type="email" 
                                        value={config.supportEmail} 
                                        onChange={e => setConfig({ ...config, supportEmail: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">WhatsApp de Suporte</label>
                                    <input 
                                        type="text" 
                                        value={config.supportWhatsapp} 
                                        onChange={e => setConfig({ ...config, supportWhatsapp: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
                                    />
                                </div>
                            </div>
                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                <button type="submit" className="bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-cyan-600 transition shadow-lg shadow-cyan-100">Salvar Alterações</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Componente do Tutorial ---
const TutorialModal = ({ onClose }: { onClose: any }) => {
    const [step, setStep] = useState(0);
    const tutorialSteps = [
        {
            icon: <PlusCircle size={48} className="text-cyan-500" />,
            title: "1. Adicione sua primeira transação",
            text: "Clique no botão 'Nova Transação' no canto superior direito para registrar suas receitas e despesas. É rápido e fácil!"
        },
        {
            icon: <PiggyBank size={48} className="text-cyan-500" />,
            title: "2. Crie seus orçamentos",
            text: "Use o ícone do porquinho para definir limites de gastos mensais por categoria. Acompanhe seu progresso no widget de orçamentos."
        },
        {
            icon: <Printer size={48} className="text-cyan-500" />,
            title: "3. Gere relatórios",
            text: "Clique no ícone da impressora para gerar relatórios em PDF. Analise seus dados anuais e mensais de forma simples."
        },
        {
            icon: <LayoutDashboard size={48} className="text-cyan-500" />,
            title: "Tudo pronto!",
            text: "Explore o painel e organize suas finanças. Se precisar de ajuda, clique no ícone (❓) no cabeçalho. Bom controle!"
        }
    ];

    const currentStep = tutorialSteps[step];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center animate-fade-in-up">
                <div className="mb-6">{currentStep.icon}</div>
                <h2 className="text-2xl font-bold mb-4 text-slate-700">{currentStep.title}</h2>
                <p className="text-slate-600 mb-8">{currentStep.text}</p>
                <div className="flex justify-between items-center">
                    {step < tutorialSteps.length - 1 ? (
                        <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">Pular</button>
                    ) : <div></div>}
                    
                    {step < tutorialSteps.length - 1 ? (
                        <button onClick={() => setStep(s => s + 1)} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition">Próximo</button>
                    ) : (
                        <button onClick={onClose} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition">Começar a Usar!</button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main App Components ---

const CollapsibleWidget = ({ title, children, isCollapsed, onToggle, density, actions }: any) => {
    const paddingClass = DENSITY_CLASSES.padding[density as keyof typeof DENSITY_CLASSES.padding];
    return (
        <div>
            <div onClick={onToggle} className={`flex justify-between items-center cursor-pointer ${paddingClass} ${!isCollapsed ? 'border-b' : ''}`}>
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
                    {actions && <div onClick={(e) => e.stopPropagation()}>{actions}</div>}
                </div>
                <ChevronDown className={`transform transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
            </div>
            {!isCollapsed && (
                <div className={paddingClass}>
                    {children}
                </div>
            )}
        </div>
    );
};

const Dashboard = ({ stats, density }: any) => {
    const { income, balance, paid, confirmed, waiting, expense } = stats;
    const paddingClass = DENSITY_CLASSES.dashboardPadding[density as keyof typeof DENSITY_CLASSES.dashboardPadding];
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`bg-white ${paddingClass} rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow`}>
                <div>
                    <h3 className="text-slate-500 text-sm font-medium">Receitas</h3>
                    <p className="text-2xl font-bold text-emerald-600">{income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg">
                    <TrendingUp className="text-emerald-600 h-6 w-6" />
                </div>
            </div>
            
            <div className={`bg-white ${paddingClass} rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow`}>
                <div>
                    <h3 className="text-slate-500 text-sm font-medium">Despesas</h3>
                    <p className="text-2xl font-bold text-rose-600">{expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div className="bg-rose-50 p-3 rounded-lg">
                    <TrendingDown className="text-rose-600 h-6 w-6" />
                </div>
            </div>

            <div className={`bg-white ${paddingClass} rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow`}>
                <div>
                    <h3 className="text-slate-500 text-sm font-medium">Balanço Líquido</h3>
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-cyan-600' : 'text-orange-600'}`}>
                        {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
                <div className={`p-3 rounded-lg ${balance >= 0 ? 'bg-cyan-50' : 'bg-orange-50'}`}>
                    <DollarSign className={`h-6 w-6 ${balance >= 0 ? 'text-cyan-600' : 'text-orange-600'}`} />
                </div>
            </div>

            <div className={`bg-white ${paddingClass} rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow`}>
                <div>
                    <h3 className="text-slate-500 text-sm font-medium">Taxa de Poupança</h3>
                    <p className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-emerald-600' : savingsRate >= 0 ? 'text-cyan-600' : 'text-rose-600'}`}>
                        {savingsRate.toFixed(1)}%
                    </p>
                </div>
                <div className={`p-3 rounded-lg ${savingsRate >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                    <PiggyBank className={`h-6 w-6 ${savingsRate >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
                </div>
            </div>

            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full bg-emerald-500"></div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Pago</p>
                        <p className="text-lg font-bold text-slate-700">{paid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full bg-amber-400"></div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Confirmado</p>
                        <p className="text-lg font-bold text-slate-700">{confirmed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full bg-rose-400"></div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Aguardando</p>
                        <p className="text-lg font-bold text-slate-700">{waiting.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FinancialHealth = ({ stats }: any) => {
    const { income, expense } = stats;
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    
    let score = 0;
    if (savingsRate > 30) score = 100;
    else if (savingsRate > 20) score = 85;
    else if (savingsRate > 10) score = 70;
    else if (savingsRate > 0) score = 50;
    else score = 30;

    const getStatus = () => {
        if (score >= 85) return { text: 'Excelente', color: 'text-emerald-500', bg: 'bg-emerald-50' };
        if (score >= 70) return { text: 'Bom', color: 'text-cyan-500', bg: 'bg-cyan-50' };
        if (score >= 50) return { text: 'Regular', color: 'text-amber-500', bg: 'bg-amber-50' };
        return { text: 'Crítico', color: 'text-rose-500', bg: 'bg-rose-50' };
    };

    const status = getStatus();

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <Activity size={20} className="text-cyan-500" /> Saúde Financeira
                </h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${status.bg} ${status.color}`}>
                    {status.text}
                </span>
            </div>
            <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                            className="text-slate-100 stroke-current"
                            strokeWidth="3"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className={`${status.color.replace('text', 'stroke')} stroke-current transition-all duration-1000 ease-out`}
                            strokeWidth="3"
                            strokeDasharray={`${score}, 100`}
                            strokeLinecap="round"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" className="text-[8px] font-bold fill-current text-slate-700" textAnchor="middle">{score}%</text>
                    </svg>
                </div>
                <div className="flex-1 space-y-2">
                    <p className="text-sm text-slate-500 leading-tight">
                        Sua taxa de poupança está em <span className="font-bold text-slate-700">{savingsRate.toFixed(1)}%</span>. 
                        {score >= 85 ? " Você está no caminho certo!" : " Tente reduzir gastos supérfluos."}
                    </p>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${status.color.replace('text', 'bg')} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Charts = ({ data, annualData, year }: any) => {
    if (data.length === 0) return (<div className="text-center text-slate-500 py-12 bg-white rounded-xl border border-dashed border-slate-300"><h3 className="text-lg font-semibold mb-2">Análise de Despesas Mensal</h3><p>Nenhuma despesa registrada neste mês para exibir gráficos.</p></div>);
    
    const cashFlowData = useMemo(() => {
        return annualData.incomeTotals.map((income: number, i: number) => ({
            name: new Date(year, i, 1).toLocaleString('pt-BR', { month: 'short' }),
            Receitas: income,
            Despesas: annualData.expenseTotals[i],
            Saldo: income - annualData.expenseTotals[i]
        }));
    }, [annualData, year]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
                <h3 className="text-lg font-bold mb-6 text-slate-700 flex items-center gap-2">
                    <TrendingUp size={20} className="text-cyan-500" /> Fluxo de Caixa Anual ({year})
                </h3>
                <div className="h-[300px] w-full" style={{ minWidth: 0, minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                        <AreaChart data={cashFlowData}>
                            <defs>
                                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value}`} />
                            <Tooltip 
                                formatter={(value: any) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend iconType="circle" />
                            <Area type="monotone" dataKey="Receitas" stroke="#10b981" fillOpacity={1} fill="url(#colorReceitas)" strokeWidth={3} />
                            <Area type="monotone" dataKey="Despesas" stroke="#f43f5e" fillOpacity={1} fill="url(#colorDespesas)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
                    <h3 className="text-lg font-bold mb-6 text-slate-700 flex items-center gap-2">
                        <PieChartIcon size={20} className="text-cyan-500" /> Distribuição de Gastos
                    </h3>
                    <div className="h-[300px] w-full" style={{ minWidth: 0, minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                            <PieChart>
                                <Pie 
                                    data={data} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={70}
                                    outerRadius={100} 
                                    paddingAngle={5}
                                    stroke="none"
                                >
                                    {data.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value: any) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
                    <h3 className="text-lg font-bold mb-6 text-slate-700 flex items-center gap-2">
                        <Table size={20} className="text-cyan-500" /> Ranking de Categorias
                    </h3>
                    <div className="h-[300px] w-full" style={{ minWidth: 0, minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                            <BarChart data={data.slice(0, 5)} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={100} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    formatter={(value: any) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AnnualBalanceTable = ({ data, year, onEdit, onDelete, onStatusChange }: any) => {
    const { incomeTotals, expenseTotals, grandTotalIncome, grandTotalExpense, monthlyTransactions } = data;
    const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
    const monthNames = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1).toLocaleString('pt-BR', { month: 'short' }));
    const tableContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (tableContainerRef.current) {
            const container = tableContainerRef.current;
            const previousMonthIndex = new Date().getMonth() - 1;
            const targetMonthIndex = previousMonthIndex < 0 ? 0 : previousMonthIndex;
            const targetCell = container.querySelector(`table th:nth-child(${targetMonthIndex + 2})`) as HTMLElement;
            if (targetCell) {
                const containerWidth = container.offsetWidth;
                const cellLeft = targetCell.offsetLeft;
                const cellWidth = targetCell.offsetWidth;
                const scrollPosition = cellLeft - (containerWidth / 2) + (cellWidth / 2);
                container.scrollLeft = scrollPosition;
            }
        }
    }, [data]);

    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto" ref={tableContainerRef}>
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10">Descrição</th>
                            {monthNames.map((name, i) => (
                                <th 
                                    key={name} 
                                    onClick={() => setExpandedMonth(expandedMonth === i ? null : i)}
                                    className={`px-3 py-3 text-right text-xs font-medium uppercase tracking-wider capitalize cursor-pointer hover:bg-slate-100 transition-colors ${expandedMonth === i ? 'bg-cyan-50 text-cyan-600' : 'text-slate-500'}`}
                                >
                                    {name}
                                    <div className="text-[10px] font-normal lowercase">{expandedMonth === i ? 'ocultar' : 'ver detalhes'}</div>
                                </th>
                            ))}
                            <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        <tr>
                            <td className="px-3 py-4 whitespace-nowrap font-medium text-slate-900 sticky left-0 bg-white z-10">Receitas</td>
                            {incomeTotals.map((total: any, i: number) => (
                                <td key={i} className={`px-3 py-4 text-right text-green-600 ${expandedMonth === i ? 'bg-cyan-50/30' : ''}`}>
                                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                            ))}
                            <td className="px-3 py-4 text-right font-bold text-green-700">
                                {grandTotalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                        </tr>
                        <tr>
                            <td className="px-3 py-4 whitespace-nowrap font-medium text-slate-900 sticky left-0 bg-white z-10">Despesas</td>
                            {expenseTotals.map((total: any, i: number) => (
                                <td key={i} className={`px-3 py-4 text-right text-red-600 ${expandedMonth === i ? 'bg-cyan-50/30' : ''}`}>
                                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                            ))}
                            <td className="px-3 py-4 text-right font-bold text-red-700">
                                {grandTotalExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot className="bg-slate-100">
                        <tr>
                            <td className="px-3 py-3 text-left font-bold text-slate-700 sticky left-0 bg-slate-100 z-10">Balanço</td>
                            {incomeTotals.map((inc: any, i: number) => { 
                                const balance = inc - expenseTotals[i]; 
                                return (
                                    <td key={i} className={`px-3 py-3 text-right font-bold ${expandedMonth === i ? 'bg-cyan-50/50' : ''} ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                        {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                ); 
                            })}
                            <td className={`px-3 py-3 text-right font-bold ${(grandTotalIncome - grandTotalExpense) >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                                {(grandTotalIncome - grandTotalExpense).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {expandedMonth !== null && (
                <div className="p-6 bg-slate-50 border-t border-slate-200 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                            <Calendar size={20} className="text-cyan-500" /> 
                            Detalhes de {new Date(year, expandedMonth, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h4>
                        <button 
                            onClick={() => setExpandedMonth(null)}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h5 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <TrendingUp size={16} /> Receitas
                            </h5>
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                <TransactionList 
                                    transactions={monthlyTransactions[expandedMonth].filter(t => t.type === 'income')} 
                                    onEdit={onEdit} 
                                    onDelete={onDelete}
                                    onStatusChange={onStatusChange} 
                                />
                            </div>
                        </div>
                        <div>
                            <h5 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <TrendingDown size={16} /> Despesas
                            </h5>
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                <TransactionList 
                                    transactions={monthlyTransactions[expandedMonth].filter(t => t.type === 'expense')} 
                                    onEdit={onEdit} 
                                    onDelete={onDelete}
                                    onStatusChange={onStatusChange} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Custom Hooks (Lógica Refatorada) ---

const useDataManagement = (db: any, userId: string, isDemo: boolean = false) => {
    const [transactions, setTransactions] = useState<any[]>(isDemo ? MOCK_TRANSACTIONS : []);
    const [budgets, setBudgets] = useState<any>({});
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);

    useEffect(() => {
        if (isDemo) return;
        if (!db || !userId) return;
        const appId = 'meu-controle-financeiro';
        const settingsDocRef = doc(db, `artifacts/${appId}/users/${userId}/settings/userSettings`);
        const unsubscribeSettings = onSnapshot(settingsDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBudgets(data.budgets || {});
                setCategories(data.categories || INITIAL_CATEGORIES);
            } else {
                setDoc(settingsDocRef, { budgets: {}, categories: INITIAL_CATEGORIES });
            }
        });

        const transactionsColRef = collection(db, `artifacts/${appId}/users/${userId}/transactions`);
        const unsubscribeTransactions = onSnapshot(transactionsColRef, (querySnapshot) => {
            const transactionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(transactionsData);
        });

        return () => {
            unsubscribeSettings();
            unsubscribeTransactions();
        };
    }, [db, userId]);

    return { transactions, setTransactions, budgets, setBudgets, categories, setCategories };
};

const useUIManager = () => {
    const [view, setView] = useState('dashboard');
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [widgetOrder, setWidgetOrder] = useState(INITIAL_WIDGET_ORDER);
    const [layoutDensity, setLayoutDensity] = useState('normal');
    const [hideZeroRows, setHideZeroRows] = useState(false);
    const [collapsedWidgets, setCollapsedWidgets] = useState<any>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<any>(null);
    const [drillDown, setDrillDown] = useState<any>({ isOpen: false, transactions: [], title: '', date: null });
    const [deleteConfirmation, setDeleteConfirmation] = useState<any>({ isOpen: false, transaction: null });
    const [expenseGrouping, setExpenseGrouping] = useState('category');
    const [incomeGrouping, setIncomeGrouping] = useState('category');

    const handleOpenModal = (transaction = null) => { setEditingTransaction(transaction); setIsModalOpen(true); };

    return {
        view, setView, widgetOrder, setWidgetOrder, layoutDensity, setLayoutDensity, hideZeroRows, setHideZeroRows,
        collapsedWidgets, setCollapsedWidgets, isModalOpen, setIsModalOpen, isBatchModalOpen, setIsBatchModalOpen,
        isBudgetModalOpen, setIsBudgetModalOpen, isReportModalOpen, setIsReportModalOpen, isSettingsModalOpen,
        setIsSettingsModalOpen, editingTransaction, setEditingTransaction, drillDown, setDrillDown, deleteConfirmation,
        setDeleteConfirmation, handleOpenModal, expenseGrouping, setExpenseGrouping, incomeGrouping, setIncomeGrouping,
        isHelpOpen, setIsHelpOpen, isAdminOpen, setIsAdminOpen
    };
};

const TransactionItem = ({ transaction, onEdit, onDelete, onStatusChange }: any) => {
    const { id, type, description, date, amount, status, paymentCodeType, recurringId, installmentNumber, totalInstallments } = transaction;
    const getStatusIndicatorClass = (s: string) => {
        if (s === STATUSES.PAID) return 'bg-green-500';
        if (s === STATUSES.CONFIRMED) return 'bg-yellow-500';
        return 'bg-red-500';
    };
    const PaymentIcon = ({ type }: any) => {
        if (type?.includes('Pix')) return <QrCode size={14} className="text-slate-500" />;
        if (type === 'Código de Barras') return <Barcode size={14} className="text-slate-500" />;
        return null;
    };
    return (
        <li className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border-b last:border-b-0 group">
            <div className="flex flex-grow items-center cursor-pointer" onClick={() => onEdit(transaction)}>
                <div className="flex-shrink-0 w-2 h-10 rounded-full mr-4 bg-slate-300 relative">
                    {type === 'expense' && <div className={`absolute w-full h-full rounded-full ${getStatusIndicatorClass(status)}`} />}
                    {type === 'income' && <div className="absolute w-full h-full rounded-full bg-green-500" />}
                </div>
                <div>
                    <p className="font-semibold text-slate-700 flex items-center gap-1">
                        {description}
                        {installmentNumber && totalInstallments && <span className="text-xs text-slate-400 ml-1">[{installmentNumber}/{totalInstallments}]</span>}
                        <PaymentIcon type={paymentCodeType} />
                        {recurringId && <Repeat size={14} className="text-slate-500" />}
                    </p>
                    <p className="text-sm text-slate-500">
                        Vencimento: {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                </div>
            </div>
            <div className="flex items-center">
                <p className={`font-bold text-right mr-4 ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{type === 'income' ? '+' : '-'} {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                {type === 'expense' && (
                    <button onClick={(e) => { e.stopPropagation(); onStatusChange(id); }} className="text-slate-400 hover:text-cyan-500 p-2 rounded-full transition" title="Alterar status">
                        <ArrowUpDown size={16} />
                    </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); onEdit(transaction); }} className="text-slate-400 hover:text-cyan-500 p-2 rounded-full transition opacity-0 group-hover:opacity-100" title="Editar">
                    <Edit size={18} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(transaction); }} className="text-slate-400 hover:text-red-500 p-2 rounded-full transition opacity-0 group-hover:opacity-100" title="Excluir">
                    <Trash2 size={18} />
                </button>
            </div>
        </li>
    );
};

const TransactionList = ({ transactions, onDelete, onEdit, onStatusChange }: any) => {
    return (
        <div className="overflow-x-auto">
            {transactions.length > 0 ? (
                <ul className="space-y-3">
                    {transactions.map((t: any) => (
                        <TransactionItem key={t.id} transaction={t} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
                    ))}
                </ul>
            ) : (
                <p className="text-center text-slate-500 py-8">Nenhuma transação neste mês.</p>
            )}
        </div>
    );
};

const TransactionModal = ({ onClose, onSave, transaction, categories }: any) => {
    const [type, setType] = useState(transaction?.type || 'expense');
    const [amount, setAmount] = useState(transaction?.amount || '');
    const [description, setDescription] = useState(transaction?.description || '');
    const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState(transaction?.category || categories.expense[0]);
    const [account, setAccount] = useState(transaction?.account || ACCOUNT_TYPES[0]);
    const [status, setStatus] = useState(transaction?.status || STATUSES.WAITING);
    const [error, setError] = useState('');
    const [paymentCodeType, setPaymentCodeType] = useState(transaction?.paymentCodeType || 'Nenhum');
    const [paymentCode, setPaymentCode] = useState(transaction?.paymentCode || '');
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState('monthly');
    const [recurrences, setRecurrences] = useState(12);
    const isEditing = !!transaction?.id;

    useEffect(() => {
        if (!isEditing) {
            setCategory(type === 'expense' ? categories.expense[0] : categories.income[0]);
        }
    }, [type, isEditing, categories]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(paymentCode).then(() => toast.success('Código copiado!'));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description || !date || !category || !account) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        onSave({
            id: transaction?.id,
            type,
            amount: parseFloat(amount),
            description,
            date,
            category,
            account,
            status: type === 'expense' ? status : null,
            paymentCodeType: paymentCodeType === 'Nenhum' ? null : paymentCodeType,
            paymentCode: paymentCodeType === 'Nenhum' ? null : paymentCode,
            isRecurring,
            frequency,
            recurrences
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg animate-fade-in-up overflow-y-auto max-h-[90vh]">
                <h2 className="text-2xl font-bold mb-6 text-slate-700">{isEditing ? 'Editar' : 'Adicionar'} Transação</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 bg-red-100 p-3 rounded-md text-sm mb-4">{error}</p>}
                    <div className="mb-4">
                        <div className="flex rounded-md shadow-sm">
                            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 px-4 rounded-l-md transition ${type === 'expense' ? 'bg-red-500 text-white' : 'bg-slate-200'}`} disabled={isEditing}>Despesa</button>
                            <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 px-4 rounded-r-md transition ${type === 'income' ? 'bg-green-500 text-white' : 'bg-slate-200'}`} disabled={isEditing}>Receita</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-600">Descrição</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Valor (R$)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" min="0" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Data de Vencimento</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" required />
                        </div>
                        {type === 'expense' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                                    <option value={STATUSES.WAITING}>Aguardando</option>
                                    <option value={STATUSES.CONFIRMED}>Confirmado</option>
                                    <option value={STATUSES.PAID}>Pago</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Centro de Custo</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                                {categories[type as keyof typeof categories].map((c: string) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg transition">Cancelar</button>
                        <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const BatchTransactionModal = ({ onClose, onSaveBatch, categories }: any) => {
    const [baseData, setBaseData] = useState({ type: 'expense', description: '', category: categories.expense[0], account: ACCOUNT_TYPES[0] });
    const [entries, setEntries] = useState([{ id: crypto.randomUUID(), monthYear: '', amount: '' }]);
    const [error, setError] = useState('');
    const handleBaseDataChange = (field: string, value: string) => {
        const newData = { ...baseData, [field]: value };
        if (field === 'type') {
            newData.category = value === 'expense' ? categories.expense[0] : categories.income[0];
        }
        setBaseData(newData);
    };
    const handleEntryChange = (id: string, field: string, value: string) => {
        setEntries(entries.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
    };
    const handleAddEntry = () => {
        const lastEntry = entries[entries.length - 1];
        let nextMonthYear = '';
        if (lastEntry && lastEntry.monthYear) {
            const [year, month] = lastEntry.monthYear.split('-').map(Number);
            const nextDate = new Date(year, month - 1, 1);
            nextDate.setMonth(nextDate.getMonth() + 1);
            nextMonthYear = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
        }
        setEntries([...entries, { id: crypto.randomUUID(), monthYear: nextMonthYear, amount: '' }]);
    };
    const handleRemoveEntry = (id: string) => {
        setEntries(entries.filter(entry => entry.id !== id));
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!baseData.description || !baseData.category || !baseData.account) {
            setError('Por favor, preencha todos os dados comuns.');
            return;
        }
        const areEntriesValid = entries.every(entry => entry.monthYear && Number(entry.amount) > 0);
        if (!areEntriesValid) {
            setError('Todos os lançamentos devem ter Mês/Ano e um valor maior que zero.');
            return;
        }
        const transactionsToCreate = entries.map(entry => ({ ...baseData, date: `${entry.monthYear}-01`, amount: parseFloat(entry.amount) }));
        onSaveBatch(transactionsToCreate);
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl animate-fade-in-up max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold mb-4 text-slate-700">Lançamento em Lote</h2>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2">
                    {error && <p className="text-red-500 bg-red-100 p-3 rounded-md text-sm mb-4">{error}</p>}
                    <fieldset className="border p-4 rounded-md mb-4">
                        <legend className="text-lg font-semibold px-2 text-slate-600">Dados Comuns</legend>
                        <div className="mb-4">
                            <div className="flex rounded-md shadow-sm">
                                <button type="button" onClick={() => handleBaseDataChange('type', 'expense')} className={`flex-1 py-2 px-4 rounded-l-md transition ${baseData.type === 'expense' ? 'bg-red-500 text-white' : 'bg-slate-200'}`}>Despesa</button>
                                <button type="button" onClick={() => handleBaseDataChange('type', 'income')} className={`flex-1 py-2 px-4 rounded-r-md transition ${baseData.type === 'income' ? 'bg-green-500 text-white' : 'bg-slate-200'}`}>Receita</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Descrição</label>
                                <input type="text" value={baseData.description} onChange={e => handleBaseDataChange('description', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Centro de Custo</label>
                                <select value={baseData.category} onChange={e => handleBaseDataChange('category', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                                    {categories[baseData.type as keyof typeof categories].map((c: string) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Tipo de Conta</label>
                                <select value={baseData.account} onChange={e => handleBaseDataChange('account', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                                    {ACCOUNT_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-semibold px-2 text-slate-600">Lançamentos Individuais</legend>
                        <div className="space-y-3">
                            {entries.map((entry, index) => (
                                <div key={entry.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-md">
                                    <span className="font-bold text-slate-500">{index + 1}</span>
                                    <div className="flex-1">
                                        <input type="month" value={entry.monthYear} onChange={e => handleEntryChange(entry.id, 'monthYear', e.target.value)} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-sm" required />
                                    </div>
                                    <div className="flex-1">
                                        <input type="number" value={entry.amount} onChange={e => handleEntryChange(entry.id, 'amount', e.target.value)} step="0.01" min="0.01" placeholder="Valor (R$)" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-sm" required />
                                    </div>
                                    <button type="button" onClick={() => handleRemoveEntry(entry.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full disabled:opacity-50" disabled={entries.length <= 1}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddEntry} className="mt-4 w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-4 rounded-lg transition text-sm flex items-center justify-center gap-2">
                            <PlusCircle size={16} /> Adicionar Lançamento
                        </button>
                    </fieldset>
                </form>
                <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg transition">Cancelar</button>
                    <button type="button" onClick={handleSubmit} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition">Salvar Lote</button>
                </div>
            </div>
        </div>
    );
};

const DrillDownModal = ({ isOpen, onClose, title, transactions, onEdit, onDelete, date, onStatusChange }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl animate-fade-in-up max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h2 className="text-xl font-bold text-slate-700">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition"><X size={20} /></button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    <TransactionList transactions={transactions} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
                </div>
                <div className="mt-6 flex justify-end border-t pt-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg transition">Fechar</button>
                </div>
            </div>
        </div>
    );
};

const CalendarView = ({ currentDate, transactions, onDayClick, density }: any) => {
    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = [];
        let currentDay = new Date(firstDayOfMonth);
        let startingDayOfWeek = firstDayOfMonth.getDay();
        startingDayOfWeek = (startingDayOfWeek === 0) ? 6 : startingDayOfWeek - 1;

        for (let i = 0; i < startingDayOfWeek; i++) {
            daysInMonth.push({ date: null, isPlaceholder: true });
        }
        while (currentDay <= lastDayOfMonth) {
            const dateStr = currentDay.toISOString().split('T')[0];
            const dayTransactions = transactions.filter((t: any) => t.date === dateStr);
            const income = dayTransactions.filter((t: any) => t.type === 'income').reduce((acc: any, t: any) => acc + t.amount, 0);
            const expense = dayTransactions.filter((t: any) => t.type === 'expense').reduce((acc: any, t: any) => acc + t.amount, 0);
            daysInMonth.push({ date: new Date(currentDay), isPlaceholder: false, transactions: dayTransactions, balance: income - expense });
            currentDay.setDate(currentDay.getDate() + 1);
        }
        return daysInMonth;
    }, [currentDate, transactions]);
    const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-500 text-sm mb-2">
                {weekDays.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {calendarData.map((day, index) => (
                    <div key={index} className={`border rounded-md h-32 flex flex-col p-1 ${day.isPlaceholder ? 'bg-slate-50' : 'cursor-pointer hover:bg-cyan-50'}`} onClick={() => !day.isPlaceholder && onDayClick(day.date)} >
                        {!day.isPlaceholder && (
                            <>
                                <span className="font-bold text-slate-600 text-sm">{day.date.getDate()}</span>
                                <div className="flex-grow overflow-y-auto text-xs mt-1 space-y-1">
                                    {day.transactions.map((t: any) => (
                                        <div key={t.id} className={`p-1 rounded text-white truncate ${t.type === 'income' ? 'bg-blue-500' : 'bg-red-500'}`}>{t.description}</div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const BudgetStatus = ({ budgets, monthlyExpenses, categories }: any) => {
    const budgetData = useMemo(() => {
        return Object.keys(budgets)
            .filter(cat => budgets[cat] > 0 && categories.expense.includes(cat))
            .map(cat => {
                const spent = monthlyExpenses[cat] || 0;
                const budget = budgets[cat];
                const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                let barColor = 'bg-emerald-500';
                if (percentage > 90) barColor = 'bg-rose-500';
                else if (percentage > 75) barColor = 'bg-amber-400';
                return { category: cat, spent, budget, percentage, barColor };
            });
    }, [budgets, monthlyExpenses, categories]);

    if (budgetData.length === 0) return <p className="text-center text-slate-500 py-8">Nenhum orçamento definido.</p>;
    return (
        <div className="space-y-5">
            {budgetData.map(item => (
                <div key={item.category}>
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="font-bold text-slate-700">{item.category}</span>
                        <span className="text-slate-500 font-medium">
                            {item.spent.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} 
                            <span className="mx-1 text-slate-300">/</span> 
                            {item.budget.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className={`${item.barColor} h-full rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-end mt-1">
                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${item.percentage > 100 ? 'text-rose-500' : 'text-slate-400'}`}>
                            {item.percentage.toFixed(0)}% Utilizado
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const BudgetModal = ({ onClose, onSave, currentBudgets, categories }: any) => {
    const [budgets, setBudgets] = useState(currentBudgets);
    const handleBudgetChange = (category: string, value: string) => {
        setBudgets((prev: any) => ({ ...prev, [category]: parseFloat(value) || 0 }));
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl animate-fade-in-up max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4">Definir Orçamentos</h2>
                <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.expense.map((category: string) => (
                        <div key={category}>
                            <label className="block text-sm font-medium text-slate-600">{category}</label>
                            <input type="number" step="0.01" value={budgets[category] || ''} onChange={(e) => handleBudgetChange(category, e.target.value)} className="mt-1 block w-full rounded-md border-slate-300" />
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                    <button onClick={onClose} className="bg-slate-200 px-4 py-2 rounded-lg">Cancelar</button>
                    <button onClick={() => onSave(budgets)} className="bg-cyan-500 text-white px-4 py-2 rounded-lg">Salvar</button>
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, transaction }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
                <h2 className="text-xl font-bold text-slate-700 mb-4">Confirmar Exclusão</h2>
                <p className="text-slate-600 mb-6">Deseja excluir esta transação?</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-slate-200 px-4 py-2 rounded-lg">Cancelar</button>
                    <button onClick={() => onConfirm(transaction, 'single')} className="bg-red-500 text-white px-4 py-2 rounded-lg">Excluir</button>
                </div>
            </div>
        </div>
    );
};

const UpcomingBills = ({ bills, onEdit, onDelete, onStatusChange }: any) => {
    const { overdue, dueToday, dueNext7Days } = bills;
    const hasBills = overdue.length > 0 || dueToday.length > 0 || dueNext7Days.length > 0;
    return (
        <div>
            {!hasBills ? (
                <p className="text-center text-slate-500 py-8">Nenhuma conta a vencer.</p>
            ) : (
                <div className="space-y-4">
                    {overdue.length > 0 && (
                        <div>
                            <h4 className="font-bold text-red-600 mb-2">Atrasadas</h4>
                            <TransactionList transactions={overdue} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
                        </div>
                    )}
                    {dueToday.length > 0 && (
                        <div>
                            <h4 className="font-bold text-yellow-600 mb-2">Vencendo Hoje</h4>
                            <TransactionList transactions={dueToday} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ReportModal = ({ onClose, onGenerate }: any) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-6">Gerar Relatório PDF</h2>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium">Início</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full rounded-md border-slate-300" /></div>
                    <div><label className="block text-sm font-medium">Fim</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full rounded-md border-slate-300" /></div>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-slate-200 px-4 py-2 rounded-lg">Cancelar</button>
                    <button onClick={() => onGenerate({ startDate, endDate })} className="bg-teal-500 text-white px-4 py-2 rounded-lg">Gerar PDF</button>
                </div>
            </div>
        </div>
    );
};

const SettingsModal = ({ onClose, categories, onSaveCategories, density, onDensityChange }: any) => {
    const [localCategories, setLocalCategories] = useState(categories);
    const [newCategory, setNewCategory] = useState({ expense: '', income: '' });

    const handleAdd = (type: 'expense' | 'income') => {
        if (!newCategory[type]) return;
        setLocalCategories((prev: any) => ({
            ...prev,
            [type]: [...prev[type], newCategory[type]]
        }));
        setNewCategory({ ...newCategory, [type]: '' });
    };

    const handleRemove = (type: 'expense' | 'income', cat: string) => {
        setLocalCategories((prev: any) => ({
            ...prev,
            [type]: prev[type].filter((c: string) => c !== cat)
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl animate-fade-in-up max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Configurações</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 space-y-8">
                    <section>
                        <h3 className="font-bold mb-4 text-slate-700 flex items-center gap-2"><Layout size={18} /> Visualização</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {['super-compact', 'compact', 'normal', 'relaxed', 'super-relaxed'].map(d => (
                                <button 
                                    key={d} 
                                    onClick={() => onDensityChange(d)}
                                    className={`px-2 py-2 rounded-md text-xs capitalize transition ${density === d ? 'bg-cyan-500 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    {d.replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="font-bold mb-4 text-slate-700 flex items-center gap-2"><Tags size={18} /> Centros de Custo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {(['expense', 'income'] as const).map(type => (
                                <div key={type} className="bg-slate-50 p-4 rounded-lg">
                                    <h4 className="font-bold mb-4 capitalize text-slate-600 text-sm">{type === 'expense' ? 'Despesas' : 'Receitas'}</h4>
                                    <div className="flex gap-2 mb-4">
                                        <input 
                                            type="text" 
                                            value={newCategory[type]} 
                                            onChange={e => setNewCategory({ ...newCategory, [type]: e.target.value })}
                                            placeholder="Nova categoria..."
                                            className="flex-1 rounded-md border-slate-300 text-sm"
                                        />
                                        <button onClick={() => handleAdd(type)} className="bg-cyan-500 text-white p-2 rounded-md"><Plus size={16} /></button>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {localCategories[type].map((cat: string) => (
                                            <div key={cat} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 text-sm group">
                                                <span>{cat}</span>
                                                <button onClick={() => handleRemove(type, cat)} className="text-red-400 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
                    <button onClick={onClose} className="bg-slate-200 px-4 py-2 rounded-lg">Cancelar</button>
                    <button onClick={() => { onSaveCategories(localCategories); onClose(); }} className="bg-cyan-500 text-white px-4 py-2 rounded-lg">Salvar Alterações</button>
                </div>
            </div>
        </div>
    );
};

const DashboardApp = ({ user, db, onLogout, userProfile, onUpdateProfile, isDemo }: any) => {
    const { transactions, setTransactions, budgets, setBudgets, categories, setCategories } = useDataManagement(db, user.uid, isDemo);
    const ui = useUIManager();
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthlyData = useMemo(() => {
        const filtered = transactions.filter(t => {
            const d = new Date(t.date + 'T00:00:00');
            return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
        });
        const income = filtered.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = filtered.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const balance = income - expense;
        const expenseByCategory = filtered.filter(t => t.type === 'expense').reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
        const chartData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value: value as number })).sort((a, b) => b.value - a.value);
        const paid = filtered.filter(t => t.type === 'expense' && t.status === STATUSES.PAID).reduce((acc, t) => acc + t.amount, 0);
        const confirmed = filtered.filter(t => t.type === 'expense' && t.status === STATUSES.CONFIRMED).reduce((acc, t) => acc + t.amount, 0);
        const waiting = filtered.filter(t => t.type === 'expense' && t.status === STATUSES.WAITING).reduce((acc, t) => acc + t.amount, 0);
        return { filtered, income, expense, balance, chartData, expenseByCategory, paid, confirmed, waiting };
    }, [transactions, currentDate]);

    const upcomingBills = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const unpaid = transactions.filter(t => t.type === 'expense' && t.status !== STATUSES.PAID && t.date);
        const overdue = unpaid.filter(t => new Date(t.date + 'T00:00:00') < today);
        const dueToday = unpaid.filter(t => new Date(t.date + 'T00:00:00').getTime() === today.getTime());
        const dueNext7Days = unpaid.filter(t => {
            const dueDate = new Date(t.date + 'T00:00:00');
            const sevenDays = new Date(today);
            sevenDays.setDate(today.getDate() + 7);
            return dueDate > today && dueDate <= sevenDays;
        });
        return { overdue, dueToday, dueNext7Days };
    }, [transactions]);

    const handleSaveTransaction = async (data: any) => {
        const appId = 'meu-controle-financeiro';
        const colRef = collection(db, `artifacts/${appId}/users/${user.uid}/transactions`);
        if (data.id) {
            await updateDoc(doc(colRef, data.id), data);
            toast.success('Transação atualizada!');
        } else {
            await addDoc(colRef, data);
            toast.success('Transação adicionada!');
        }
        ui.setIsModalOpen(false);
    };

    const handleSaveBatchTransactions = async (batchData: any[]) => {
        const appId = 'meu-controle-financeiro';
        const batch = writeBatch(db);
        batchData.forEach(item => {
            const newDocRef = doc(collection(db, `artifacts/${appId}/users/${user.uid}/transactions`));
            batch.set(newDocRef, { ...item, status: item.type === 'expense' ? STATUSES.WAITING : null });
        });
        await batch.commit();
        ui.setIsBatchModalOpen(false);
        toast.success(`${batchData.length} transações salvas!`);
    };

    const handleDeleteTransaction = async (transaction: any) => {
        const appId = 'meu-controle-financeiro';
        await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/transactions`, transaction.id));
        ui.setDeleteConfirmation({ isOpen: false, transaction: null });
        toast.success('Transação removida.');
    };

    const handleStatusChange = async (id: string) => {
        const appId = 'meu-controle-financeiro';
        const t = transactions.find(t => t.id === id);
        if (!t) return;
        const nextStatus = t.status === STATUSES.WAITING ? STATUSES.CONFIRMED : t.status === STATUSES.CONFIRMED ? STATUSES.PAID : STATUSES.WAITING;
        await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/transactions`, id), { status: nextStatus });
    };

    const handleSaveBudgets = async (newBudgets: any) => {
        const appId = 'meu-controle-financeiro';
        const settingsDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/settings/userSettings`);
        await setDoc(settingsDocRef, { budgets: newBudgets }, { merge: true });
        ui.setIsBudgetModalOpen(false);
        toast.success('Orçamentos salvos!');
    };

    const handleSaveSettings = async (newCategories: any) => {
        const appId = 'meu-controle-financeiro';
        const settingsDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/settings/userSettings`);
        await setDoc(settingsDocRef, { categories: newCategories }, { merge: true });
        toast.success('Configurações salvas!');
    };

    const handleDayClick = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        const filtered = transactions.filter(t => t.date === dateStr);
        ui.setDrillDown({ isOpen: true, transactions: filtered, title: `Lançamentos de ${date.toLocaleDateString('pt-BR')}`, date: dateStr });
    };

    const handleGenerateCustomReport = (options: any) => {
        const doc = new jsPDF();
        
        const filtered = transactions.filter((t: any) => {
            const tDate = new Date(t.date + 'T00:00:00');
            const start = new Date(options.startDate + 'T00:00:00');
            const end = new Date(options.endDate + 'T00:00:00');
            return tDate >= start && tDate <= end;
        });

        doc.setFontSize(18);
        doc.text('Relatório Financeiro', 14, 22);
        doc.setFontSize(11);
        doc.text(`Período: ${options.startDate} a ${options.endDate}`, 14, 30);

        const head = [['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor']];
        const body = filtered.map((t: any) => [
            t.date,
            t.type === 'income' ? 'Receita' : 'Despesa',
            t.description,
            t.category,
            t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        ]);

        autoTable(doc, {
            head,
            body,
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: [38, 166, 154] }
        });

        doc.save(`relatorio-${options.startDate}-${options.endDate}.pdf`);
        ui.setIsReportModalOpen(false);
        toast.success('Relatório gerado com sucesso!');
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        if ('Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted');
        }
    }, []);

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) return;
        const permission = await Notification.requestPermission();
        setNotificationsEnabled(permission === 'granted');
        if (permission === 'granted') {
            toast.success('Notificações ativadas!');
        }
    };

    const checkUpcomingBillsNotifications = (bills: any[]) => {
        if (Notification.permission !== 'granted') return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        bills.forEach(bill => {
            const billDate = new Date(bill.date + 'T00:00:00');
            if (billDate >= today && billDate <= threeDaysFromNow && bill.status !== STATUSES.PAID) {
                const daysLeft = Math.ceil((billDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const title = daysLeft === 0 ? 'Conta vence HOJE!' : `Conta vence em ${daysLeft} dias`;
                
                new Notification(title, {
                    body: `${bill.description}: ${bill.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
                    icon: '/favicon.ico' // Assumindo que existe
                });
            }
        });
    };

    useEffect(() => {
        if (upcomingBills.length > 0 && notificationsEnabled) {
            // Evitar múltiplas notificações na mesma sessão
            const lastCheck = sessionStorage.getItem('last_bill_check');
            const todayStr = new Date().toDateString();
            
            if (lastCheck !== todayStr) {
                checkUpcomingBillsNotifications(upcomingBills);
                sessionStorage.setItem('last_bill_check', todayStr);
            }
        }
    }, [upcomingBills, notificationsEnabled]);

    const filteredMonthlyTransactions = useMemo(() => {
        return monthlyData.filtered.filter(t => 
            t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [monthlyData.filtered, searchTerm]);

    const annualData = useMemo(() => {
        const year = currentDate.getFullYear();
        const incomeTotals = Array(12).fill(0);
        const expenseTotals = Array(12).fill(0);
        const monthlyTransactions: any[][] = Array.from({ length: 12 }, () => []);

        transactions.forEach(t => {
            const d = new Date(t.date + 'T00:00:00');
            if (d.getFullYear() === year) {
                const month = d.getMonth();
                if (t.type === 'income') incomeTotals[month] += t.amount;
                else expenseTotals[month] += t.amount;
                monthlyTransactions[month].push(t);
            }
        });
        const grandTotalIncome = incomeTotals.reduce((a, b) => a + b, 0);
        const grandTotalExpense = expenseTotals.reduce((a, b) => a + b, 0);
        return { incomeTotals, expenseTotals, grandTotalIncome, grandTotalExpense, monthlyTransactions };
    }, [transactions, currentDate]);

    return (
        <div className="bg-slate-100 min-h-screen">
            <header className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-50">
                <h1 className="text-xl font-bold flex items-center"><DollarSign className="text-cyan-500 mr-2" /> Meu Controle Financeiro</h1>
                <div className="flex gap-2">
                    {user.email === APP_CONFIG.adminEmail && (
                        <button onClick={() => ui.setIsAdminOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Painel Admin"><ShieldCheck size={20} /></button>
                    )}
                    <button onClick={() => ui.setIsHelpOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Manual do Usuário"><HelpCircle size={20} /></button>
                    {!notificationsEnabled && 'Notification' in window && (
                        <button 
                            onClick={requestNotificationPermission} 
                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg animate-pulse" 
                            title="Ativar Notificações"
                        >
                            <Bell size={20} />
                        </button>
                    )}
                    <button onClick={() => ui.setIsReportModalOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg" title="Gerar PDF"><Printer size={20} /></button>
                    <button onClick={() => ui.setIsBatchModalOpen(true)} className="bg-teal-500 text-white px-4 py-2 rounded-lg hidden sm:flex items-center gap-2"><Layers size={18} /> Lote</button>
                    <button onClick={() => ui.handleOpenModal()} className="bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"><PlusCircle size={18} /> Nova</button>
                    <button onClick={() => ui.setIsSettingsModalOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg"><Settings size={20} /></button>
                    <button onClick={onLogout} className="p-2 text-red-500 hover:bg-red-50"><LogOut size={20} /></button>
                </div>
            </header>
            <main className="container mx-auto p-4 space-y-6">
                {isDemo && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><EyeOff size={20} /></div>
                            <div>
                                <p className="text-amber-800 font-bold text-sm">Você está no Modo Demo</p>
                                <p className="text-amber-700 text-xs">Os dados são fictícios e não serão salvos permanentemente.</p>
                            </div>
                        </div>
                        <button onClick={onLogout} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-700 transition">Criar Minha Conta</button>
                    </div>
                )}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft /></button>
                        <h2 className="text-xl font-bold capitalize w-48 text-center">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight /></button>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
                        <button onClick={() => ui.setView('dashboard')} className={`flex-1 md:flex-none px-6 py-2 rounded-md transition ${ui.view === 'dashboard' ? 'bg-white shadow text-cyan-600 font-bold' : 'text-slate-500'}`}>Painel</button>
                        <button onClick={() => ui.setView('calendar')} className={`flex-1 md:flex-none px-6 py-2 rounded-md transition ${ui.view === 'calendar' ? 'bg-white shadow text-cyan-600 font-bold' : 'text-slate-500'}`}>Calendário</button>
                    </div>
                </div>

                {ui.view === 'dashboard' ? (
                    <div className="space-y-6">
                        <Dashboard stats={monthlyData} density={ui.layoutDensity} />
                        
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <CollapsibleWidget 
                                title={`Balanço Anual - ${currentDate.getFullYear()}`} 
                                isCollapsed={ui.collapsedWidgets['annual']} 
                                onToggle={() => ui.setCollapsedWidgets((prev: any) => ({ ...prev, annual: !prev.annual }))}
                                density={ui.layoutDensity}
                            >
                                <AnnualBalanceTable 
                                    data={annualData} 
                                    year={currentDate.getFullYear()} 
                                    onEdit={ui.handleOpenModal} 
                                    onDelete={ui.setDeleteConfirmation}
                                    onStatusChange={handleStatusChange} 
                                />
                            </CollapsibleWidget>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700"><Clock className="text-cyan-500" /> Contas a Vencer</h3>
                                    <UpcomingBills bills={upcomingBills} onEdit={ui.handleOpenModal} onDelete={ui.setDeleteConfirmation} onStatusChange={handleStatusChange} />
                                </div>
                                
                                <Charts data={monthlyData.chartData} annualData={annualData} year={currentDate.getFullYear()} />

                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-700"><Table className="text-cyan-500" /> Transações do Mês</h3>
                                        <div className="relative w-full sm:w-auto">
                                            <input 
                                                type="text" 
                                                placeholder="Buscar transação..." 
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 rounded-xl border-slate-200 text-sm focus:ring-cyan-500 focus:border-cyan-500 w-full sm:w-64 shadow-sm"
                                            />
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        </div>
                                    </div>
                                    <TransactionList transactions={filteredMonthlyTransactions} onEdit={ui.handleOpenModal} onStatusChange={handleStatusChange} />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <FinancialHealth stats={monthlyData} />
                                
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700"><PiggyBank className="text-cyan-500" /> Metas de Orçamento</h3>
                                    <BudgetStatus budgets={budgets} monthlyExpenses={monthlyData.expenseByCategory} categories={categories} />
                                    <button onClick={() => ui.setIsBudgetModalOpen(true)} className="mt-6 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-cyan-500 hover:text-cyan-500 transition-all font-medium text-sm">Configurar Orçamentos</button>
                                </div>
                                
                                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Star className="text-yellow-300" /> Dica do Dia</h3>
                                    <p className="text-sm text-cyan-50 opacity-90 leading-relaxed">
                                        {monthlyData.expense > monthlyData.income 
                                            ? "Seus gastos superaram suas receitas este mês. Tente revisar suas categorias de lazer e compras para equilibrar as contas."
                                            : "Parabéns! Você está gastando menos do que ganha. Considere investir o excedente para acelerar suas metas financeiras."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <CalendarView currentDate={currentDate} transactions={transactions} onDayClick={handleDayClick} density={ui.layoutDensity} />
                )}
            </main>

            {ui.isModalOpen && <TransactionModal onClose={() => ui.setIsModalOpen(false)} onSave={handleSaveTransaction} transaction={ui.editingTransaction} categories={categories} />}
            {ui.isBatchModalOpen && <BatchTransactionModal onClose={() => ui.setIsBatchModalOpen(false)} onSaveBatch={handleSaveBatchTransactions} categories={categories} />}
            {ui.isBudgetModalOpen && <BudgetModal onClose={() => ui.setIsBudgetModalOpen(false)} onSave={handleSaveBudgets} currentBudgets={budgets} categories={categories} />}
            {ui.isSettingsModalOpen && <SettingsModal onClose={() => ui.setIsSettingsModalOpen(false)} categories={categories} onSaveCategories={handleSaveSettings} density={ui.layoutDensity} onDensityChange={ui.setLayoutDensity} />}
            {ui.isReportModalOpen && <ReportModal onClose={() => ui.setIsReportModalOpen(false)} onGenerate={handleGenerateCustomReport} />}
            {ui.isAdminOpen && <AdminPanel db={db} onClose={() => ui.setIsAdminOpen(false)} />}
            {ui.isHelpOpen && <UserManual onClose={() => ui.setIsHelpOpen(false)} />}
            <DrillDownModal isOpen={ui.drillDown.isOpen} onClose={() => ui.setDrillDown({ ...ui.drillDown, isOpen: false })} title={ui.drillDown.title} transactions={ui.drillDown.transactions} onEdit={ui.handleOpenModal} date={ui.drillDown.date} onStatusChange={handleStatusChange} />
            <DeleteConfirmationModal isOpen={ui.deleteConfirmation.isOpen} onClose={() => ui.setDeleteConfirmation({ isOpen: false, transaction: null })} onConfirm={handleDeleteTransaction} transaction={ui.deleteConfirmation.transaction} />
        </div>
    );
};

export default function App() {
    const [user, setUser] = useState<any>(null);
    const [auth, setAuth] = useState<any>(null);
    const [db, setDb] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isDemo, setIsDemo] = useState(false);
    const [appConfig, setAppConfig] = useState(APP_CONFIG);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch('/api/admin/config');
                if (res.ok) {
                    const data = await res.json();
                    setAppConfig(data);
                }
            } catch (e) {
                console.log("Servidor offline ou erro ao buscar config.");
            }
        };
        fetchConfig();
        // Expose setAppConfig to window so AdminPanel can update it
        (window as any).setAppConfig = setAppConfig;
    }, []);

    useEffect(() => {
        const firebaseConfig = {
            apiKey: "AIzaSyCv_BOIvgNvF35xGkBl1URnGhzn1LILbFI",
            authDomain: "meu-controle-financeiro-dab61.firebaseapp.com",
            projectId: "meu-controle-financeiro-dab61",
            storageBucket: "meu-controle-financeiro-dab61.appspot.com",
            messagingSenderId: "359873689601",
            appId: "1:359873689601:web:a67817678fdbb18ce76800"
        };

        const app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        
        setAuth(authInstance);
        setDb(dbInstance);

        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            if (user) {
                setUser(user);
                setIsDemo(false);
            } else {
                setUser(null);
                if (!isDemo) {
                    setUserProfile(null);
                    setIsLoading(false);
                }
            }
        });

        return () => unsubscribe();
    }, [isDemo]);

    useEffect(() => {
        if (user && db) {
            const appId = 'meu-controle-financeiro';
            const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/userProfile`);
            const unsubscribe = onSnapshot(profileDocRef, async (docSnap) => {
                let currentProfile = docSnap.exists() ? docSnap.data() : null;
                
                // Check whitelist and admin status to allow live promotion even if Firestore is stale
                let isPreApproved = false;
                try {
                    const res = await fetch('/api/admin/whitelist');
                    if (res.ok) {
                        const data = await res.json();
                        const whitelist = data.emails || [];
                        isPreApproved = whitelist.includes(user.email?.toLowerCase() || '');
                    }
                } catch (e) {}

                const isAdmin = user.email === appConfig.adminEmail;
                const shouldBeActive = isAdmin || isPreApproved;

                if (currentProfile) {
                    // If Firestore says pending but they should be active, update Firestore
                    if (currentProfile.licenseStatus !== 'active' && shouldBeActive) {
                        currentProfile.licenseStatus = 'active';
                        await setDoc(profileDocRef, { licenseStatus: 'active' }, { merge: true });
                    }
                    setUserProfile(currentProfile);
                    
                    // Sync with server on every change to ensure admin has latest data
                    fetch('/api/admin/users/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...currentProfile, email: user.email, uid: user.uid })
                    }).catch(() => {});
                } else {
                    const initialProfile = { 
                        licenseStatus: shouldBeActive ? 'active' : 'pending', 
                        tutorialCompleted: false,
                        email: user.email,
                        uid: user.uid,
                        createdAt: new Date().toISOString()
                    };
                    setUserProfile(initialProfile);
                    await setDoc(profileDocRef, initialProfile);
                    
                    // Sync with server
                    fetch('/api/admin/users/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(initialProfile)
                    }).catch(() => {});
                }
                setIsLoading(false);
            });
            return () => unsubscribe();
        }
    }, [user, db, appConfig.adminEmail]);

    const handleLogin = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);

    const handleRegister = async (email: string, password: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const appId = 'meu-controle-financeiro';
        const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/userProfile`);
        
        // Check Whitelist from Server API
        let isPreApproved = false;
        try {
            const res = await fetch('/api/admin/whitelist');
            if (res.ok) {
                const data = await res.json();
                const whitelist = data.emails || [];
                isPreApproved = whitelist.includes(email.toLowerCase());
            }
        } catch (e) {
            console.log("Whitelist não disponível no servidor.");
        }

        const initialProfile = {
            email: user.email,
            uid: user.uid,
            createdAt: new Date().toISOString(),
            licenseStatus: (user.email === appConfig.adminEmail || isPreApproved) ? 'active' : 'pending',
            tutorialCompleted: false
        };

        await setDoc(profileDocRef, initialProfile);

        // Register user on server for admin tracking
        try {
            await fetch('/api/admin/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(initialProfile)
            });
        } catch (e) {
            console.log("Erro ao registrar usuário no servidor.");
        }

        return userCredential;
    };

    const handleLogout = () => {
        if (isDemo) {
            setIsDemo(false);
            setUserProfile(null);
            return;
        }
        signOut(auth).then(() => {
            setUserProfile(null);
            toast.success('Você saiu com sucesso!');
        });
    };

    const handleDemoMode = () => {
        setIsDemo(true);
        setUser({ email: 'visitante@demo.com', uid: 'demo-user' });
        setUserProfile({ licenseStatus: 'active', tutorialCompleted: true, isDemo: true });
        setIsLoading(false);
        toast.success('Entrando no Modo Demo...');
    };

    const handleUpdateProfile = async (dataToUpdate: any) => {
        if (isDemo) return;
        if (user && db) {
            const appId = 'meu-controle-financeiro';
            const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/userProfile`);
            try {
                await setDoc(profileDocRef, dataToUpdate, { merge: true });
            } catch (error) {
                console.error("Erro ao atualizar perfil:", error);
                toast.error("Não foi possível salvar a preferência.");
            }
        }
    };

    const handleSubscribe = async () => {
        if (isDemo) {
            toast.error("Você está no modo demo. Crie uma conta para assinar.");
            return;
        }
        toast.success('Solicitação enviada! Fale com o suporte para ativar.');
    };

    if (isLoading || (user && !userProfile)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <div className="text-center">
                    <p className="text-lg text-slate-600">A carregar...</p>
                </div>
            </div>
        );
    }

    if (!user && !isDemo) {
        return <LandingPage onLogin={handleLogin} onRegister={handleRegister} onDemo={handleDemoMode} />;
    }

    if (userProfile.licenseStatus === 'active' || user.email === appConfig.adminEmail) {
        return (
            <>
                <DashboardApp user={user} db={db} onLogout={handleLogout} userProfile={userProfile} onUpdateProfile={handleUpdateProfile} isDemo={isDemo} />
                <Toaster position="bottom-right" />
            </>
        );
    }
    
    return (
        <>
            <SubscriptionPage user={user} onSubscribe={handleSubscribe} onLogout={handleLogout} config={appConfig} />
            <Toaster position="bottom-right" />
        </>
    );
}
