import React, { useState, useEffect, useMemo } from 'react';
import { 
    DollarSign, ShieldCheck, Sun, Moon, HelpCircle, Bell, Printer, Layers, 
    PlusCircle, Settings, LogOut, ArrowLeft, ArrowRight, PiggyBank, Table, 
    Search, Clock, Star, EyeOff 
} from 'lucide-react';
import { collection, doc, addDoc, updateDoc, deleteDoc, writeBatch, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useDataManagement } from '../hooks/useDataManagement';
import { useUIManager } from '../hooks/useUIManager';
import { Dashboard } from './Dashboard';
import { FinancialHealth } from './FinancialHealth';
import { Charts } from './Charts';
import { AnnualBalanceTable } from './AnnualBalanceTable';
import { TransactionList } from './TransactionList';
import { CollapsibleWidget } from './CollapsibleWidget';
import { TransactionModal } from './TransactionModal';
import { BatchTransactionModal } from './BatchTransactionModal';
import { DrillDownModal } from './DrillDownModal';
import { CalendarView } from './CalendarView';
import { BudgetStatus } from './BudgetStatus';
import { BudgetModal } from './BudgetModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { UpcomingBills } from './UpcomingBills';
import { ReportModal } from './ReportModal';
import { SettingsModal } from './SettingsModal';
import { AdminPanel } from './AdminPanel';
import { UserManual } from './UserManual';
import { STATUSES, APP_CONFIG, DENSITY_CLASSES } from '../constants';

export const DashboardApp = ({ user, db, onLogout, userProfile, onUpdateProfile, isDemo }: any) => {
    if (!user) return null;
    const { transactions, setTransactions, budgets, setBudgets, categories, setCategories } = useDataManagement(db, user.uid, isDemo);
    const ui = useUIManager(userProfile?.uiSettings);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Persist UI settings to Firestore
    useEffect(() => {
        if (!isDemo && userProfile) {
            const currentSettings = userProfile.uiSettings || {};
            if (currentSettings.layoutDensity !== ui.layoutDensity || currentSettings.theme !== ui.theme) {
                onUpdateProfile({
                    uiSettings: {
                        ...currentSettings,
                        layoutDensity: ui.layoutDensity,
                        theme: ui.theme
                    }
                });
            }
        }
    }, [ui.layoutDensity, ui.theme, isDemo, onUpdateProfile, userProfile]);

    const monthlyData = useMemo(() => {
        const filtered = transactions.filter(t => {
            const d = new Date(t.date + 'T00:00:00');
            return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
        });
        const income = filtered.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = filtered.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const balance = income - expense;
        const expenseByCategory = filtered.filter(t => t.type === 'expense').reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {} as any);
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
        if (isDemo) {
            if (data.id) {
                setTransactions(transactions.map(t => t.id === data.id ? { ...data } : t));
                toast.success('Transação atualizada (Demo)!');
            } else {
                setTransactions([...transactions, { ...data, id: `demo-${Date.now()}` }]);
                toast.success('Transação adicionada (Demo)!');
            }
            ui.setIsModalOpen(false);
            return;
        }
        const appId = 'meu-controle-financeiro';
        const colRef = collection(db, `artifacts/${appId}/users/${user.uid}/transactions`);
        const { id, ...payload } = data;

        if (id) {
            await updateDoc(doc(colRef, id), payload);
            toast.success('Transação atualizada!');
        } else {
            await addDoc(colRef, payload);
            toast.success('Transação adicionada!');
        }
        ui.setIsModalOpen(false);
    };

    const handleSaveBatchTransactions = async (batchData: any[]) => {
        if (isDemo) {
            const newTransactions = batchData.map(item => ({ 
                ...item, 
                id: `demo-${Math.random().toString(36).substr(2, 9)}`,
                status: item.type === 'expense' ? STATUSES.WAITING : null 
            }));
            setTransactions([...transactions, ...newTransactions]);
            ui.setIsBatchModalOpen(false);
            toast.success(`${batchData.length} transações salvas (Demo)!`);
            return;
        }
        const appId = 'meu-controle-financeiro';
        const batch = writeBatch(db);
        batchData.forEach(item => {
            const { id, ...payload } = item;
            const newDocRef = doc(collection(db, `artifacts/${appId}/users/${user.uid}/transactions`));
            batch.set(newDocRef, { ...payload, status: item.type === 'expense' ? STATUSES.WAITING : null });
        });
        await batch.commit();
        ui.setIsBatchModalOpen(false);
        toast.success(`${batchData.length} transações salvas!`);
    };

    const handleDeleteTransaction = async (transaction: any) => {
        if (isDemo) {
            setTransactions(transactions.filter(t => t.id !== transaction.id));
            ui.setDeleteConfirmation({ isOpen: false, transaction: null });
            toast.success('Transação removida (Demo).');
            return;
        }
        const appId = 'meu-controle-financeiro';
        await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/transactions`, transaction.id));
        ui.setDeleteConfirmation({ isOpen: false, transaction: null });
        toast.success('Transação removida.');
    };

    const handleStatusChange = async (id: string) => {
        const t = transactions.find(t => t.id === id);
        if (!t) return;
        const nextStatus = t.status === STATUSES.WAITING ? STATUSES.CONFIRMED : t.status === STATUSES.CONFIRMED ? STATUSES.PAID : STATUSES.WAITING;
        
        if (isDemo) {
            setTransactions(transactions.map(item => item.id === id ? { ...item, status: nextStatus } : item));
            return;
        }
        const appId = 'meu-controle-financeiro';
        await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/transactions`, id), { status: nextStatus });
    };

    const handleRepeatTransaction = async (transaction: any) => {
        const originalDate = new Date(transaction.date + 'T00:00:00');
        const nextMonthDate = new Date(originalDate);
        nextMonthDate.setMonth(originalDate.getMonth() + 1);
        
        if (nextMonthDate.getMonth() !== (originalDate.getMonth() + 1) % 12) {
            nextMonthDate.setDate(0);
        }

        const { id, ...rest } = transaction;
        const newTransaction = {
            ...rest,
            date: nextMonthDate.toISOString().split('T')[0],
            status: transaction.type === 'expense' ? STATUSES.WAITING : null,
            recurringId: null,
            installmentNumber: null,
            totalInstallments: null
        };

        if (isDemo) {
            setTransactions([...transactions, { ...newTransaction, id: `demo-${Date.now()}` }]);
            toast.success('Lançamento repetido para o próximo mês (Demo)!');
            return;
        }

        const appId = 'meu-controle-financeiro';
        const colRef = collection(db, `artifacts/${appId}/users/${user.uid}/transactions`);
        await addDoc(colRef, newTransaction);
        toast.success('Lançamento repetido para o próximo mês!');
    };

    const handleSaveBudgets = async (newBudgets: any) => {
        if (isDemo) {
            setBudgets(newBudgets);
            ui.setIsBudgetModalOpen(false);
            toast.success('Orçamentos salvos (Demo)!');
            return;
        }
        const appId = 'meu-controle-financeiro';
        const settingsDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/settings/userSettings`);
        await setDoc(settingsDocRef, { budgets: newBudgets }, { merge: true });
        ui.setIsBudgetModalOpen(false);
        toast.success('Orçamentos salvos!');
    };

    const handleSaveSettings = async (newCategories: any) => {
        if (isDemo) {
            setCategories(newCategories);
            toast.success('Configurações salvas (Demo)!');
            return;
        }
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
            const start = options.startDate ? new Date(options.startDate + 'T00:00:00') : new Date(0);
            const end = options.endDate ? new Date(options.endDate + 'T00:00:00') : new Date(8640000000000000);
            
            const matchesDate = tDate >= start && tDate <= end;
            const matchesType = options.type === 'all' || t.type === options.type;
            const matchesCategory = options.category === 'all' || t.category === options.category;
            const matchesStatus = options.status === 'all' || t.status === options.status;

            return matchesDate && matchesType && matchesCategory && matchesStatus;
        });

        doc.setFontSize(18);
        doc.text('Relatório Financeiro Personalizado', 14, 22);
        doc.setFontSize(11);
        doc.text(`Período: ${options.startDate || 'Início'} a ${options.endDate || 'Fim'}`, 14, 30);
        doc.text(`Filtros: Tipo: ${options.type}, Categoria: ${options.category}, Status: ${options.status}`, 14, 36);

        const head = [['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor', 'Status']];
        const body = filtered.map((t: any) => [
            t.date,
            t.type === 'income' ? 'Receita' : 'Despesa',
            t.description,
            t.category,
            t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            t.status || '-'
        ]);

        autoTable(doc, {
            head,
            body,
            startY: 45,
            theme: 'striped',
            headStyles: { fillColor: [6, 182, 212] }
        });

        doc.save(`relatorio-financeiro-${new Date().getTime()}.pdf`);
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
                    icon: '/favicon.ico'
                });
            }
        });
    };

    useEffect(() => {
        const allBills = [...(upcomingBills.overdue || []), ...(upcomingBills.dueToday || []), ...(upcomingBills.dueNext7Days || [])];
        
        if (allBills.length > 0 && notificationsEnabled) {
            const lastCheck = sessionStorage.getItem('last_bill_check');
            const todayStr = new Date().toDateString();
            
            if (lastCheck !== todayStr) {
                checkUpcomingBillsNotifications(allBills);
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
        <div className={`min-h-screen transition-colors duration-300 ${ui.theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-300">
                <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-cyan-500 p-2 rounded-xl text-white shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Meu Controle</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Resumo Financeiro</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700 mr-2">
                            <div className="px-3 py-1">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Bem-vindo(a),</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{user.email?.split('@')[0]}</p>
                            </div>
                        </div>
                        
                        {user.email === APP_CONFIG.adminEmail && (
                        <button onClick={() => ui.setIsAdminOpen(true)} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Painel Admin"><ShieldCheck size={20} /></button>
                    )}
                    <button 
                        onClick={() => ui.setTheme(ui.theme === 'dark' ? 'light' : 'dark')} 
                        className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" 
                        title={ui.theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
                    >
                        {ui.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={() => ui.setIsHelpOpen(true)} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Manual do Usuário"><HelpCircle size={20} /></button>
                    {!notificationsEnabled && 'Notification' in window && (
                        <button 
                            onClick={requestNotificationPermission} 
                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg animate-pulse" 
                            title="Ativar Notificações"
                        >
                            <Bell size={20} />
                        </button>
                    )}
                    <button onClick={() => ui.setIsReportModalOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors" title="Gerar PDF"><Printer size={20} /></button>
                    <button onClick={() => ui.setIsBatchModalOpen(true)} className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl hidden sm:flex items-center gap-2 shadow-lg shadow-teal-200 dark:shadow-teal-900/20 transition-all"><Layers size={18} /> Lote</button>
                    <button onClick={() => ui.handleOpenModal()} className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20 transition-all"><PlusCircle size={18} /> Nova</button>
                    <button onClick={() => ui.setIsSettingsModalOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors" title="Configurações"><Settings size={20} /></button>
                    <button onClick={onLogout} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Sair"><LogOut size={20} /></button>
                </div>
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
                <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition text-slate-600 dark:text-slate-400"><ArrowLeft size={20} /></button>
                        <h2 className="text-lg font-bold capitalize text-slate-700 dark:text-slate-200">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition text-slate-600 dark:text-slate-400"><ArrowRight size={20} /></button>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
                        <button onClick={() => ui.setView('dashboard')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm transition whitespace-nowrap ${ui.view === 'dashboard' ? 'bg-white dark:bg-slate-800 shadow text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Painel</button>
                        <button onClick={() => ui.setView('transactions')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm transition whitespace-nowrap ${ui.view === 'transactions' ? 'bg-white dark:bg-slate-800 shadow text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Lançamentos</button>
                        <button onClick={() => ui.setView('calendar')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm transition whitespace-nowrap ${ui.view === 'calendar' ? 'bg-white dark:bg-slate-800 shadow text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Calendário</button>
                    </div>
                </div>

                {ui.view === 'dashboard' && (
                    <div className={`${DENSITY_CLASSES.spacing[ui.layoutDensity as keyof typeof DENSITY_CLASSES.spacing] || 'space-y-6'} animate-fade-in`}>
                        <Dashboard stats={monthlyData} density={ui.layoutDensity} userProfile={userProfile} />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <Charts data={monthlyData.chartData} annualData={annualData} year={currentDate.getFullYear()} density={ui.layoutDensity} />
                            </div>
                            <div>
                                <FinancialHealth stats={monthlyData} density={ui.layoutDensity} />
                                <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 ${DENSITY_CLASSES.cardPadding[ui.layoutDensity as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-6'} mt-6`}>
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-200"><PiggyBank className="text-cyan-500" /> Orçamentos</h3>
                                    <BudgetStatus budgets={budgets} monthlyExpenses={monthlyData.expenseByCategory} categories={categories} density={ui.layoutDensity} />
                                    <button onClick={() => ui.setIsBudgetModalOpen(true)} className="mt-6 w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-cyan-500 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all font-medium text-sm">Configurar Orçamentos</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {ui.view === 'transactions' && (
                    <div className={`${DENSITY_CLASSES.spacing[ui.layoutDensity as keyof typeof DENSITY_CLASSES.spacing] || 'space-y-6'} animate-fade-in`}>
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
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
                                    onRepeat={handleRepeatTransaction}
                                    density={ui.layoutDensity}
                                />
                            </CollapsibleWidget>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className={`lg:col-span-2 ${DENSITY_CLASSES.spacing[ui.layoutDensity as keyof typeof DENSITY_CLASSES.spacing] || 'space-y-6'}`}>
                                <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 ${DENSITY_CLASSES.cardPadding[ui.layoutDensity as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-6'}`}>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200"><Table className="text-cyan-500" /> Transações do Mês</h3>
                                        <div className="relative w-full sm:w-auto">
                                            <input 
                                                type="text" 
                                                placeholder="Buscar transação..." 
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200 w-full sm:w-64 shadow-sm transition-all"
                                            />
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        </div>
                                    </div>
                                    <TransactionList transactions={filteredMonthlyTransactions} onEdit={ui.handleOpenModal} onStatusChange={handleStatusChange} onRepeat={handleRepeatTransaction} density={ui.layoutDensity} />
                                </div>
                            </div>
                            <div className={DENSITY_CLASSES.spacing[ui.layoutDensity as keyof typeof DENSITY_CLASSES.spacing] || 'space-y-6'}>
                                <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 ${DENSITY_CLASSES.cardPadding[ui.layoutDensity as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-6'}`}>
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-200"><Clock className="text-cyan-500" /> Contas a Vencer</h3>
                                    <UpcomingBills bills={upcomingBills} onEdit={ui.handleOpenModal} onDelete={ui.setDeleteConfirmation} onStatusChange={handleStatusChange} onRepeat={handleRepeatTransaction} density={ui.layoutDensity} />
                                </div>
                                
                                <div className={`bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg ${DENSITY_CLASSES.cardPadding[ui.layoutDensity as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-6'} text-white`}>
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
                )}

                {ui.view === 'calendar' && (
                    <div className="animate-fade-in">
                        <CalendarView currentDate={currentDate} transactions={transactions} onDayClick={handleDayClick} density={ui.layoutDensity} />
                    </div>
                )}
            </main>

            {ui.isModalOpen && <TransactionModal onClose={() => ui.setIsModalOpen(false)} onSave={handleSaveTransaction} transaction={ui.editingTransaction} categories={categories} />}
            {ui.isBatchModalOpen && <BatchTransactionModal onClose={() => ui.setIsBatchModalOpen(false)} onSaveBatch={handleSaveBatchTransactions} categories={categories} />}
            {ui.isBudgetModalOpen && <BudgetModal onClose={() => ui.setIsBudgetModalOpen(false)} onSave={handleSaveBudgets} currentBudgets={budgets} categories={categories} />}
            {ui.isSettingsModalOpen && <SettingsModal onClose={() => ui.setIsSettingsModalOpen(false)} categories={categories} onSaveCategories={handleSaveSettings} density={ui.layoutDensity} onDensityChange={ui.setLayoutDensity} />}
            {ui.isReportModalOpen && <ReportModal onClose={() => ui.setIsReportModalOpen(false)} onGenerate={handleGenerateCustomReport} categories={categories} />}
            {ui.isAdminOpen && <AdminPanel onClose={() => ui.setIsAdminOpen(false)} />}
            {ui.isHelpOpen && <UserManual onClose={() => ui.setIsHelpOpen(false)} />}
            <DrillDownModal isOpen={ui.drillDown.isOpen} onClose={() => ui.setDrillDown({ ...ui.drillDown, isOpen: false })} title={ui.drillDown.title} transactions={ui.drillDown.transactions} onEdit={ui.handleOpenModal} onStatusChange={handleStatusChange} onRepeat={handleRepeatTransaction} density={ui.layoutDensity} />
            <DeleteConfirmationModal isOpen={ui.deleteConfirmation.isOpen} onClose={() => ui.setDeleteConfirmation({ isOpen: false, transaction: null })} onConfirm={handleDeleteTransaction} transaction={ui.deleteConfirmation.transaction} />
        </div>
    );
};
