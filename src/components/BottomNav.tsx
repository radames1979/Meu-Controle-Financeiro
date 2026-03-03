import React from 'react';
import { LayoutDashboard, ListOrdered, Calendar as CalendarIcon, PlusCircle, Settings } from 'lucide-react';

interface BottomNavProps {
    view: string;
    setView: (view: string) => void;
    onOpenNewTransaction: () => void;
    onOpenSettings: () => void;
}

export const BottomNav = ({ view, setView, onOpenNewTransaction, onOpenSettings }: BottomNavProps) => {
    const navItems = [
        { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
        { id: 'transactions', label: 'Lançamentos', icon: ListOrdered },
        { id: 'add', label: 'Nova', icon: PlusCircle, special: true },
        { id: 'calendar', label: 'Calendário', icon: CalendarIcon },
        { id: 'settings', label: 'Ajustes', icon: Settings },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 z-50 px-2 pb-safe-area-inset-bottom">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                {navItems.map((item) => {
                    if (item.special) {
                        return (
                            <button
                                key={item.id}
                                onClick={onOpenNewTransaction}
                                className="flex flex-col items-center justify-center -translate-y-4"
                            >
                                <div className="bg-cyan-500 p-3 rounded-full text-white shadow-lg shadow-cyan-500/40 border-4 border-white dark:border-slate-800 active:scale-90 transition-transform">
                                    <PlusCircle size={24} />
                                </div>
                                <span className="text-[10px] font-bold mt-1 text-cyan-600 dark:text-cyan-400">{item.label}</span>
                            </button>
                        );
                    }

                    const isActive = view === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => item.id === 'settings' ? onOpenSettings() : setView(item.id)}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                                isActive 
                                ? 'text-cyan-600 dark:text-cyan-400' 
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                        >
                            <item.icon size={20} className={isActive ? 'animate-pulse' : ''} />
                            <span className={`text-[10px] font-bold mt-1 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
