import React, { useState } from 'react';
import { Mail, Lock, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);

export const AuthForm = ({ onLogin, onRegister, onDemo, onForgotPassword, onGoogleLogin }: { onLogin: any, onRegister: any, onDemo: any, onForgotPassword: any, onGoogleLogin: any }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleGoogleClick = async () => {
        setIsGoogleLoading(true);
        try {
            await onGoogleLogin();
        } finally {
            setIsGoogleLoading(false);
        }
    };

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

    const handleForgotPassword = async () => {
        if (!email) {
            toast.error('Digite seu e-mail no campo acima primeiro.');
            return;
        }
        setIsSendingReset(true);
        try {
            await onForgotPassword(email);
            toast.success('Enviamos um link de redefinição de senha para o seu e-mail.');
        } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
                toast.error('Não encontramos uma conta com esse e-mail.');
            } else if (err.code === 'auth/invalid-email') {
                toast.error('O formato do e-mail é inválido.');
            } else {
                toast.error('Não foi possível enviar o e-mail de redefinição. Tente novamente.');
            }
        } finally {
            setIsSendingReset(false);
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
                    {isLogin && (
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            disabled={isSendingReset}
                            className="text-sm font-bold text-cyan-500 hover:text-cyan-600 transition-colors -mt-3 disabled:opacity-60"
                        >
                            {isSendingReset ? 'Enviando...' : 'Esqueci minha senha'}
                        </button>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-4 rounded-full transition-all shadow-lg shadow-cyan-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isLogin ? 'Entrar' : 'Cadastrar'}
                    </button>
                </form>

                <div className="relative py-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-700"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-800 px-4 text-slate-400 font-bold tracking-wider">Ou continue com</span></div>
                </div>

                <button
                    onClick={handleGoogleClick}
                    disabled={isGoogleLoading}
                    className="w-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 py-4 rounded-full font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 disabled:opacity-60"
                >
                    <GoogleIcon /> {isGoogleLoading ? 'Conectando...' : 'Entrar com Google'}
                </button>

                <button onClick={onDemo} className="w-full mt-4 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 py-4 rounded-full font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700">
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
