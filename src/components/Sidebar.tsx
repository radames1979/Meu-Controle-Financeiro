import React from 'react';
import { 
    LayoutDashboard, ListOrdered, Calendar as CalendarIcon, 
    Settings, HelpCircle, ShieldCheck, LogOut, ChevronLeft, ChevronRight,
    PlusCircle, Layers, Printer
} from 'lucide-react';
import { APP_CONFIG } from '../constants';

interface SidebarProps {
    view: string;
    setView: (view: string) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    user: any;
    isAdmin: boolean;
    onLogout: () => void;
    onOpenSettings: () => void;
    onOpenHelp: () => void;
    onOpenAdmin: () => void;
    onOpenNewTransaction: () => void;
    onOpenBatch: () => void;
    onOpenReport: () => void;
}

export const Sidebar = ({ 
    view, setView, isCollapsed, setIsCollapsed, user, isAdmin, 
    onLogout, onOpenSettings, onOpenHelp, onOpenAdmin,
    onOpenNewTransaction, onOpenBatch, onOpenReport
}: SidebarProps) => {
    const menuItems = [
        { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
        { id: 'transactions', label: 'Lançamentos', icon: ListOrdered },
        { id: 'calendar', label: 'Calendário', icon: CalendarIcon },
    ];

    return (
        <aside 
            className={`hidden md:flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 sticky top-0 h-screen z-40 ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
            <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 animate-fade-in">
                        <div className="bg-cyan-500 p-1.5 rounded-lg text-white shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20">
                            <LayoutDashboard size={18} />
                        </div>
                        <span className="font-black text-slate-800 dark:text-white tracking-tight">Meu Controle</span>
                    </div>
                )}
                {isCollapsed && (
                    <div className="mx-auto bg-cyan-500 p-1.5 rounded-lg text-white shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20">
                        <LayoutDashboard size={18} />
                    </div>
                )}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <div className="flex-grow py-6 px-3 space-y-2 overflow-y-auto no-scrollbar">
                <div className="mb-4 px-2">
                    {!isCollapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Menu Principal</p>}
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                                view === item.id 
                                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20 font-bold' 
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                            <item.icon size={20} />
                            {!isCollapsed && <span className="animate-fade-in">{item.label}</span>}
                        </button>
                    ))}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 px-2">
                    {!isCollapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Ações Rápidas</p>}
                    <button onClick={onOpenNewTransaction} className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all">
                        <PlusCircle size={20} className="text-cyan-500" />
                        {!isCollapsed && <span className="animate-fade-in">Nova Transação</span>}
                    </button>
                    <button onClick={onOpenBatch} className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all">
                        <Layers size={20} className="text-teal-500" />
                        {!isCollapsed && <span className="animate-fade-in">Lançamento em Lote</span>}
                    </button>
                    <button onClick={onOpenReport} className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all">
                        <Printer size={20} className="text-blue-500" />
                        {!isCollapsed && <span className="animate-fade-in">Relatórios PDF</span>}
                    </button>
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-1">
                {isAdmin && (
                    <button onClick={onOpenAdmin} className="w-full flex items-center gap-3 p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all">
                        <ShieldCheck size={20} />
                        {!isCollapsed && <span className="text-sm font-medium">Administração</span>}
                    </button>
                )}
                <button onClick={onOpenHelp} className="w-full flex items-center gap-3 p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all">
                    <HelpCircle size={20} />
                    {!isCollapsed && <span className="text-sm font-medium">Ajuda</span>}
                </button>
                <button onClick={onOpenSettings} className="w-full flex items-center gap-3 p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all">
                    <Settings size={20} />
                    {!isCollapsed && <span className="text-sm font-medium">Configurações</span>}
                </button>
                <button onClick={onLogout} className="w-full flex items-center gap-3 p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all mt-2">
                    <LogOut size={20} />
                    {!isCollapsed && <span className="text-sm font-bold">Sair</span>}
                </button>
                
                {!isCollapsed && (
                    <div className="mt-4 px-2 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 animate-fade-in">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Usuário</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{user.email?.split('@')[0]}</p>
                    </div>
                )}
            </div>
        </aside>
    );
};
