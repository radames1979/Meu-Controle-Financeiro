import React, { useState } from 'react';
import { X, Layout, Tags, Plus, Trash2, Shield, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { APP_VERSION } from '../version';

export const SettingsModal = ({ onClose, categories, onSaveCategories, density, onDensityChange, sessionTimeout, onSessionTimeoutChange, notificationAdvance, onNotificationAdvanceChange }: any) => {
    const [localCategories, setLocalCategories] = useState(categories);
    const [newCategory, setNewCategory] = useState({ expense: '', income: '' });
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'categories'>('general');

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
