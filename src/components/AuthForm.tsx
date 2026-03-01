import React, { useState } from 'react';
import { Mail, Lock, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AuthForm = ({ onLogin, onRegister, onDemo }: { onLogin: any, onRegister: any, onDemo: any }) => {
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
            let errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';
            
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                errorMessage = 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.';
            } else if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'Este e-mail já está cadastrado em outra conta.';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'O formato do e-mail é inválido.';
            } else if (err.code === 'auth/operation-not-allowed') {
                errorMessage = 'O login por E-mail/Senha não está ativado no Console do Firebase.';
            } else if (err.code === 'auth/too-many-requests') {
                errorMessage = 'Muitas tentativas falhas. Sua conta foi temporariamente bloqueada. Tente mais tarde.';
            } else if (err.code === 'auth/user-disabled') {
                errorMessage = 'Esta conta de usuário foi desativada pelo administrador.';
            }
            
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-100 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-6">{isLogin ? 'Acesse sua conta' : 'Crie sua conta'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm text-center">{error}</p>}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="email"
                            placeholder="Seu e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-slate-200 transition-all"
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
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-slate-200 transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-cyan-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isLogin ? 'Entrar' : 'Cadastrar'}
                    </button>
                </form>

                <div className="relative py-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-700"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-800 px-4 text-slate-400 font-bold tracking-wider">Ou experimente</span></div>
                </div>

                <button onClick={onDemo} className="w-full bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 py-4 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700">
                    <EyeOff size={18} /> Modo Demo (Visitante)
                </button>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
                    {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-bold text-cyan-500 hover:text-cyan-600 ml-2 transition-colors">
                        {isLogin ? 'Cadastre-se' : 'Faça login'}
                    </button>
                </p>
            </div>
        </div>
    );
};
