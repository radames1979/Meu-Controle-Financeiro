import React, { useState } from 'react';
import { X, Layout, Tags, Plus, Trash2, Shield, Bell, Copy, Key, RefreshCw, AlertTriangle, CheckCircle, Code, Sun, Moon } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { registerFCMToken, isPushSupported, DEFAULT_VAPID_KEY } from '../services/fcm';
import { APP_VERSION } from '../version';

export const SettingsModal = ({ onClose, user, categories, onSaveCategories, density, onDensityChange, theme, onThemeChange, sessionTimeout, onSessionTimeoutChange, notificationAdvance, onNotificationAdvanceChange }: any) => {
    const [localCategories, setLocalCategories] = useState(categories);
    const [newCategory, setNewCategory] = useState({ expense: '', income: '' });
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'categories'>('general');

    const [fcmToken, setFcmToken] = useState(() => localStorage.getItem('fcm_token') || '');
    const [customVapid, setCustomVapid] = useState(() => localStorage.getItem('fcm_vapid_key') || '');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [iframeWarning, setIframeWarning] = useState(false);
    const [payloadGuideOpen, setPayloadGuideOpen] = useState(false);

    const handleRegisterFCM = async () => {
        if (!user) {
            toast.error("Usuário não autenticado.");
            return;
        }
        setIsRegistering(true);
        setIframeWarning(false);
        try {
            const result = await registerFCMToken(user.uid, customVapid || undefined);
            if (result.success && result.token) {
                setFcmToken(result.token || '');
                toast.success("Dispositivo registrado na nuvem (FCM) com sucesso!");
            } else if (result.iframeBlocked) {
                setIframeWarning(true);
                toast.error("Navegador bloqueou o registro do Push no Iframe.");
            } else {
                toast.error(result.error || "Erro desconhecido ao registrar.");
            }
        } catch (e: any) {
            toast.error("Falha ao registrar para notificações push.");
        } finally {
            setIsRegistering(false);
        }
    };

    const handleCopyToken = () => {
        if (!fcmToken) return;
        navigator.clipboard.writeText(fcmToken);
        toast.success("Token copiado para a área de transferência!");
    };

    const handleSimulateLocalNotification = () => {
        if (!('Notification' in window)) {
            toast.error("Este navegador não suporta notificações.");
            return;
        }
        if (Notification.permission !== 'granted') {
            toast.error("Por favor, ative as permissões de notificação primeiro!");
            return;
        }
        new Notification("Alerta de Conta (Demonstração)", {
            body: "Conta de Energia: R$ 185,40 vence em breve (Simulação de Push FCM)",
            icon: '/favicon.ico',
        });
        toast.success("Notificação local de teste enviada!");
    };

    const handleAdd = (type: 'expense' | 'income') => {
        if (!newCategory[type]) return;
        if (localCategories[type].includes(newCategory[type])) {
            toast.error('Esta categoria já existe!');
            return;
        }
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl animate-fade-in-up max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Configurações</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 dark:text-slate-500 transition-colors"><X size={20} /></button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-700 mb-6 gap-2">
                    <button 
                        onClick={() => setActiveTab('general')}
                        className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'general' ? 'border-cyan-500 text-cyan-500' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        <Layout size={16} /> Geral
                    </button>
                    <button 
                        onClick={() => setActiveTab('notifications')}
                        className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'notifications' ? 'border-cyan-500 text-cyan-500' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        <Bell size={16} /> Notificações
                    </button>
                    <button 
                        onClick={() => setActiveTab('categories')}
                        className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'categories' ? 'border-cyan-500 text-cyan-500' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        <Tags size={16} /> Centros de Custo
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 space-y-8 no-scrollbar">
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-fade-in-up">
                            <section>
                                <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-200 flex items-center gap-2"><Layout size={18} /> Visualização</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Densidade do Layout</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                            {['super-compact', 'compact', 'normal', 'relaxed', 'super-relaxed'].map(d => (
                                                <button 
                                                    key={d} 
                                                    onClick={() => onDensityChange(d)}
                                                    className={`px-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition ${density === d ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                                >
                                                    {d.replace('-', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Tema de Aparência</h4>
                                        <div className="grid grid-cols-2 gap-3 max-w-sm">
                                            <button 
                                                onClick={() => onThemeChange('light')}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${theme === 'light' ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600/50'}`}
                                            >
                                                <Sun size={16} /> Claro
                                            </button>
                                            <button 
                                                onClick={() => onThemeChange('dark')}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${theme === 'dark' ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600/50'}`}
                                            >
                                                <Moon size={16} /> Escuro
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    <Shield size={18} className="text-cyan-500" /> Sessão e Segurança
                                </h3>
                                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                Encerramento de Sessão Automático
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                Desconecta sua conta automaticamente após um período de inatividade para proteger seus dados.
                                            </p>
                                        </div>
                                        <select 
                                            value={sessionTimeout} 
                                            onChange={(e) => onSessionTimeoutChange(e.target.value)}
                                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200 shadow-sm p-3 transition-all min-w-[200px]"
                                        >
                                            <option value="5">5 minutos (Máxima segurança)</option>
                                            <option value="10">10 minutos</option>
                                            <option value="15">15 minutos (Recomendado/Padrão)</option>
                                            <option value="30">30 minutos</option>
                                            <option value="60">1 Hora</option>
                                            <option value="off">Desativado (Indeterminado)</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <section className="space-y-6 animate-fade-in-up">
                            {/* Card 1: Local notification advance settings */}
                            <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <h3 className="font-bold mb-2 text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    <Bell size={18} className="text-cyan-500" /> Avisos de Contas a Vencer
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                                    Escolha a antecedência ideal para ser avisado sobre suas contas recorrentes ou despesas pendentes. Notificações do sistema precisam estar ativadas no topo da tela (ícone de sino).
                                </p>
                                
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                                        Período de Antecedência
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { value: '1', title: '1 Dia', desc: 'Aviso ultra-próximo' },
                                            { value: '3', title: '3 Dias', desc: 'Recomendado / Padrão' },
                                            { value: '7', title: '7 Dias', desc: 'Uma semana antes' }
                                        ].map(item => (
                                            <button
                                                key={item.value}
                                                type="button"
                                                onClick={() => onNotificationAdvanceChange(item.value)}
                                                className={`p-4 rounded-xl border text-left transition-all duration-200 relative overflow-hidden ${notificationAdvance === item.value ? 'border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10 shadow-md ring-1 ring-cyan-500' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-sm font-bold ${notificationAdvance === item.value ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                        {item.title}
                                                    </span>
                                                    {notificationAdvance === item.value && (
                                                        <span className="w-2 h-2 rounded-full bg-cyan-500" />
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                                                    {item.desc}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Firebase Cloud Messaging Push Configuration */}
                            <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                        <Shield size={18} className="text-cyan-500" /> Push Notifications (Firebase Cloud Messaging)
                                    </h3>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${isPushSupported() ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'}`}>
                                        {isPushSupported() ? 'Compatível' : 'Incompatível'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                                    Ative notificações push nativas em segundo plano para que seu dispositivo móvel ou computador receba os alertas de faturas pendentes mesmo com o aplicativo fechado.
                                </p>

                                {/* System & Client Sandbox Warnings */}
                                {iframeWarning && (
                                    <div className="mb-4 p-4 rounded-xl border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-700/40 text-xs text-yellow-800 dark:text-yellow-200 flex flex-col gap-2">
                                        <div className="flex items-center gap-2 font-bold">
                                            <AlertTriangle size={16} className="text-yellow-500 shrink-0" />
                                            <span>Restrição de Iframe Detectada</span>
                                        </div>
                                        <p>
                                            O navegador bloqueou o registro do Service Worker necessário para receber notificações Push reais devido ao sandbox seguro do Iframe no ambiente de desenvolvimento do Firebase.
                                        </p>
                                        <p className="font-semibold underline">
                                            Para cadastrar seu dispositivo real e herdar tokens reais, clique em "Abrir em Nova Aba" ou "Shared App URL" no topo/lateral do painel de controle e clique de lá!
                                        </p>
                                    </div>
                                )}

                                {!isPushSupported() && (
                                    <div className="mb-4 p-4 rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-700/40 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-rose-500 shrink-0" />
                                        <span>Este navegador não suporta Web Push Notifications ou Service Workers sob este protocolo HTTP/HTTPS seguro atual.</span>
                                    </div>
                                )}

                                {/* Token Status & Registration Panel */}
                                <div className="space-y-4">
                                    {fcmToken ? (
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle size={14} /> Dispositivo Cadastrado
                                                </span>
                                                <button 
                                                    onClick={handleRegisterFCM}
                                                    disabled={isRegistering}
                                                    className="text-xs font-bold text-cyan-500 hover:text-cyan-600 flex items-center gap-1 transition-all"
                                                >
                                                    <RefreshCw size={12} className={isRegistering ? "animate-spin" : ""} /> Recadastrar
                                                </button>
                                            </div>

                                            {/* Read-only token scroll block */}
                                            <div className="flex gap-2">
                                                <textarea
                                                    readOnly
                                                    value={fcmToken}
                                                    className="w-full text-[10px] font-mono p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 resize-none h-16 text-slate-600 dark:text-slate-300 select-all"
                                                />
                                                <button 
                                                    onClick={handleCopyToken}
                                                    title="Copiar token"
                                                    className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-300 transition-all self-center shrink-0"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                                                Este Token FCM único foi transmitido e vinculado à sua conta no banco de dados Firestore para que alertas automáticos possam mirar este terminal de forma cirúrgica.
                                            </span>

                                            <div className="pt-2 flex gap-2">
                                                <button 
                                                    type="button" 
                                                    onClick={handleSimulateLocalNotification}
                                                    className="flex-1 py-2 px-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                                >
                                                    <Bell size={14} /> Simular Alerta Local
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center flex flex-col items-center">
                                            <Bell className="text-slate-400 dark:text-slate-600 mb-2 animate-pulse" size={32} />
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhum Dispositivo Vinculado</p>
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-sm mt-1 mb-4">
                                                Gere seu Web Push Registration Token para autorizar que sua conta no Firestore receba disparos direcionados de faturas pendentes.
                                            </p>
                                            <button
                                                type="button"
                                                disabled={isRegistering}
                                                onClick={handleRegisterFCM}
                                                className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold shadow-md shadow-cyan-200 dark:shadow-cyan-900/10 transition-all flex items-center gap-2"
                                            >
                                                <RefreshCw size={14} className={isRegistering ? "animate-spin" : ""} />
                                                {isRegistering ? 'Registrando...' : 'Registrar Este Dispositivo'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Collapsible Developer integration payload payloadGuideOpen */}
                                <div className="mt-4 border-t border-slate-200/60 dark:border-slate-700/60 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setPayloadGuideOpen(!payloadGuideOpen)}
                                        className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between w-full hover:text-cyan-500"
                                    >
                                        <span className="flex items-center gap-1.5"><Code size={14} /> Integração Backend & Payloads</span>
                                        <span className="text-[10px] text-slate-400">{payloadGuideOpen ? 'Recolher' : 'Expandir'}</span>
                                    </button>
                                    
                                    {payloadGuideOpen && (
                                        <div className="mt-3 bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 font-mono text-[10px] space-y-3 overflow-x-auto select-all">
                                            <p className="text-[10px] text-slate-400 font-sans border-b border-slate-800 pb-2">
                                                Envie um POST para <code className="text-cyan-400">https://fcm.googleapis.com/v1/projects/meu-controle-financeiro-dab61/messages:send</code> usando o cabeçalho Bearer Token OAuth2 com a seguinte carga útil JSON:
                                            </p>
                                            <pre className="text-slate-300 whitespace-pre-wrap">
{`{
  "message": {
    "token": "${fcmToken || "INSIRA_O_FCM_TOKEN_GERADO"}",
    "notification": {
      "title": "Alerta de Conta - Plano Raiz",
      "body": "A fatura 'Energia da Light' de R$ 185,40 vence amanhã!"
    },
    "webpush": {
      "notification": {
        "icon": "/favicon.ico",
        "badge": "/favicon.ico"
      }
    }
  }
}`}
                                            </pre>
                                        </div>
                                    )}
                                </div>

                                {/* Advanced VAPID configuration section */}
                                <div className="mt-2 border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                                    <button 
                                        type="button"
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center justify-between w-full hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        <span className="flex items-center gap-1.5"><Key size={12} /> Configurações de Certificação (VAPID Certificate)</span>
                                        <span>{showAdvanced ? 'Esconder' : 'Mostrar'}</span>
                                    </button>

                                    {showAdvanced && (
                                        <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Custom Web Push Certification VAPID (Public Key)
                                            </label>
                                            <input 
                                                type="text"
                                                value={customVapid}
                                                onChange={(e) => {
                                                    setCustomVapid(e.target.value);
                                                    localStorage.setItem('fcm_vapid_key', e.target.value);
                                                }}
                                                placeholder={DEFAULT_VAPID_KEY}
                                                className="w-full text-[10px] font-mono p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                            />
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                                Deixe em branco para usar o certificado VAPID padrão associado às chaves do projeto Firebase Cloud Messaging nativo do sistema.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === 'categories' && (
                        <section className="animate-fade-in-up">
                            <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-200 flex items-center gap-2"><Tags size={18} /> Centros de Custo</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {(['expense', 'income'] as const).map(type => (
                                    <div key={type} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <h4 className="font-bold mb-4 capitalize text-slate-600 dark:text-slate-400 text-xs uppercase tracking-widest">{type === 'expense' ? 'Despesas' : 'Receitas'}</h4>
                                        <div className="flex gap-2 mb-4">
                                            <input 
                                                type="text" 
                                                value={newCategory[type]} 
                                                onChange={e => setNewCategory({ ...newCategory, [type]: e.target.value })}
                                                placeholder="Nova categoria..."
                                                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200 shadow-sm transition-all"
                                            />
                                            <button onClick={() => handleAdd(type)} className="bg-cyan-500 text-white p-2 rounded-xl shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20 hover:bg-cyan-600 transition"><Plus size={16} /></button>
                                        </div>
                                        <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                                            {localCategories[type].map((cat: string) => (
                                                <div key={cat} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 text-sm group shadow-sm">
                                                    <span className="text-slate-700 dark:text-slate-200 font-medium">{cat}</span>
                                                    <button onClick={() => handleRemove(type, cat)} className="text-slate-400 hover:text-red-500 transition p-1"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700 pt-6">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition">Cancelar</button>
                    <button onClick={() => { onSaveCategories(localCategories); onClose(); }} className="bg-cyan-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20 hover:bg-cyan-600 transition">Salvar Alterações</button>
                </div>
                <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-tighter opacity-50">
                    <span>Versão do Sistema</span>
                    <span className="bg-slate-100 dark:bg-slate-900/40 px-2 py-0.5 rounded">{APP_VERSION}</span>
                </div>
            </div>
        </div>
    );
};
