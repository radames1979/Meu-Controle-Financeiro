import React, { useState, useEffect, useMemo } from 'react';
import { 
    DollarSign, ShieldCheck, Sun, Moon, HelpCircle, Bell, Printer, Layers, 
    PlusCircle, Settings, LogOut, ArrowLeft, ArrowRight, PiggyBank, Table, 
    Search, Clock, Star, EyeOff, Trash2
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
import { RecurringTransactions } from './RecurringTransactions';
import { GenericConfirmationModal } from './GenericConfirmationModal';
import { AnnualComparisonCard } from './AnnualComparisonCard';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { STATUSES, APP_CONFIG, DENSITY_CLASSES } from '../constants';

export const DashboardApp = ({ user, db, onLogout, userProfile, onUpdateProfile, isDemo }: any) => {
    if (!user) return null;
    const { transactions, setTransactions, budgets, setBudgets, categories, setCategories } = useDataManagement(db, user.uid, isDemo);
    const ui = useUIManager(userProfile?.uiSettings);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
        const { id, isRecurring, frequency, recurrences, isNewCategory, ...payload } = data;
        const appId = 'meu-controle-financeiro';
        const colRef = collection(db, `artifacts/${appId}/users/${user.uid}/transactions`);

        // Adicionar nova categoria se necessário
        if (isNewCategory && payload.category) {
            const type = payload.type as 'income' | 'expense';
            if (!categories[type].includes(payload.category)) {
                const updatedCategories = {
                    ...categories,
                    [type]: [...categories[type], payload.category]
                };
                handleSaveSettings(updatedCategories);
            }
        }

        if (isDemo) {
            if (id) {
                setTransactions(transactions.map(t => t.id === id ? { ...data } : t));
                toast.success('Transação atualizada (Demo)!');
            } else if (isRecurring) {
                const recurringId = `rec-${Date.now()}`;
                const newTransactions: any[] = [];
                const startDate = new Date(payload.date + 'T00:00:00');

                for (let i = 0; i < recurrences; i++) {
                    const currentDate = new Date(startDate);
                    if (frequency === 'weekly') currentDate.setDate(startDate.getDate() + (i * 7));
                    else if (frequency === 'biweekly') currentDate.setDate(startDate.getDate() + (i * 14));
                    else if (frequency === 'monthly') currentDate.setMonth(startDate.getMonth() + i);
                    else if (frequency === 'quarterly') currentDate.setMonth(startDate.getMonth() + (i * 3));
                    else if (frequency === 'yearly') currentDate.setFullYear(startDate.getFullYear() + i);

                    newTransactions.push({
                        ...payload,
                        id: `demo-${Date.now()}-${i}`,
                        date: currentDate.toISOString().split('T')[0],
                        recurringId,
                        installmentNumber: i + 1,
                        totalInstallments: recurrences,
                        status: payload.type === 'expense' ? STATUSES.WAITING : null
                    });
                }
                setTransactions([...transactions, ...newTransactions]);
                toast.success(`${recurrences} parcelas geradas (Demo)!`);
            } else {
                setTransactions([...transactions, { ...payload, id: `demo-${Date.now()}` }]);
                toast.success('Transação adicionada (Demo)!');
            }
            ui.setIsModalOpen(false);
            return;
        }

        if (id) {
            await updateDoc(doc(colRef, id), payload);
            toast.success('Transação atualizada!');
        } else if (isRecurring) {
            const batch = writeBatch(db);
            const recurringId = `rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const startDate = new Date(payload.date + 'T00:00:00');

            for (let i = 0; i < recurrences; i++) {
                const currentDate = new Date(startDate);
                if (frequency === 'weekly') currentDate.setDate(startDate.getDate() + (i * 7));
                else if (frequency === 'biweekly') currentDate.setDate(startDate.getDate() + (i * 14));
                else if (frequency === 'monthly') currentDate.setMonth(startDate.getMonth() + i);
                else if (frequency === 'quarterly') currentDate.setMonth(startDate.getMonth() + (i * 3));
                else if (frequency === 'yearly') currentDate.setFullYear(startDate.getFullYear() + i);

                const newDocRef = doc(colRef);
                batch.set(newDocRef, {
                    ...payload,
                    date: currentDate.toISOString().split('T')[0],
                    recurringId,
                    installmentNumber: i + 1,
                    totalInstallments: recurrences,
                    status: payload.type === 'expense' ? STATUSES.WAITING : null
                });
            }
            await batch.commit();
            toast.success(`${recurrences} parcelas geradas com sucesso!`);
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

    const handleDeleteRecurrence = async (recurringId: string) => {
        const toDelete = transactions.filter(t => t.recurringId === recurringId);
        if (toDelete.length === 0) return;

        if (isDemo) {
            setTransactions(transactions.filter(t => t.recurringId !== recurringId));
            toast.success('Recorrência removida (Demo).');
            return;
        }

        const appId = 'meu-controle-financeiro';
        const batch = writeBatch(db);
        toDelete.forEach(t => {
            batch.delete(doc(db, `artifacts/${appId}/users/${user.uid}/transactions`, t.id));
        });
        await batch.commit();
        toast.success('Recorrência completa removida.');
    };

    const handleStatusChange = async (id: string) => {
        const t = transactions.find(t => t.id === id);
        if (!t) return;
        const nextStatus = t.status === STATUSES.WAITING ? STATUSES.CONFIRMED : t.status === STATUSES.CONFIRMED ? STATUSES.PAID : STATUSES.WAITING;
        
        const performChange = async () => {
            if (isDemo) {
                setTransactions(transactions.map(item => item.id === id ? { ...item, status: nextStatus } : item));
                return;
            }
            const appId = 'meu-controle-financeiro';
            await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/transactions`, id), { status: nextStatus });
            toast.success(`Status atualizado para ${nextStatus}!`);
        };

        if (nextStatus === STATUSES.PAID) {
            ui.setGenericConfirmation({
                isOpen: true,
                title: 'Confirmar Pagamento?',
                message: `Deseja marcar a transação "${t.description}" como PAGA?`,
                type: 'success',
                confirmText: 'Sim, Confirmar',
                onConfirm: performChange
            });
        } else {
            performChange();
        }
    };

    const handleRepeatTransaction = async (transaction: any) => {
        const performRepeat = async () => {
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

        ui.setGenericConfirmation({
            isOpen: true,
            title: 'Repetir Lançamento?',
            message: `Deseja criar uma cópia de "${transaction.description}" para o próximo mês (${new Date(new Date(transaction.date + 'T00:00:00').setMonth(new Date(transaction.date + 'T00:00:00').getMonth() + 1)).toLocaleDateString('pt-BR', { month: 'long' })})?`,
            type: 'info',
            confirmText: 'Sim, Repetir',
            onConfirm: performRepeat
        });
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
        <div className={`min-h-screen flex transition-colors duration-300 ${ui.theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
            {/* Desktop Sidebar */}
            <Sidebar 
                view={ui.view} 
                setView={ui.setView} 
                isCollapsed={isSidebarCollapsed} 
                setIsCollapsed={setIsSidebarCollapsed}
                user={user}
                isAdmin={user.email === APP_CONFIG.adminEmail}
                onLogout={onLogout}
                onOpenSettings={() => ui.setIsSettingsModalOpen(true)}
                onOpenHelp={() => ui.setIsHelpOpen(true)}
                onOpenAdmin={() => ui.setIsAdminOpen(true)}
                onOpenNewTransaction={() => ui.handleOpenModal()}
                onOpenBatch={() => ui.setIsBatchModalOpen(true)}
                onOpenReport={() => ui.setIsReportModalOpen(true)}
            />

            <div className="flex-grow flex flex-col min-h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="bg-cyan-500 p-1.5 rounded-lg text-white">
                            <DollarSign size={20} />
                        </div>
                        <h1 className="font-black text-slate-800 dark:text-white tracking-tight">Meu Controle</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => ui.setTheme(ui.theme === 'dark' ? 'light' : 'dark')} 
                            className="p-2 text-slate-600 dark:text-slate-400"
                        >
                            {ui.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button onClick={onLogout} className="p-2 text-red-500">
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                {/* Top Bar (Desktop only) */}
                <header className="hidden md:flex bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-4 justify-between items-center sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition text-slate-600 dark:text-slate-400 shadow-sm"><ArrowLeft size={16} /></button>
                            <h2 className="px-4 text-sm font-bold capitalize text-slate-700 dark:text-slate-200 min-w-[140px] text-center">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition text-slate-600 dark:text-slate-400 shadow-sm"><ArrowRight size={16} /></button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => ui.setTheme(ui.theme === 'dark' ? 'light' : 'dark')} 
                            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                        >
                            {ui.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Usuário</p>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{user.email?.split('@')[0]}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-cyan-200 dark:shadow-none">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-grow overflow-y-auto custom-scrollbar pb-24 md:pb-8">
                    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
                        {isDemo && (
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl text-amber-600 dark:text-amber-500"><EyeOff size={20} /></div>
                                    <div>
                                        <p className="text-amber-800 dark:text-amber-200 font-bold text-sm">Modo de Demonstração</p>
                                        <p className="text-amber-700 dark:text-amber-400 text-xs">Os dados são fictícios e não serão salvos permanentemente.</p>
                                    </div>
                                </div>
                                <button onClick={onLogout} className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-amber-600/20">Criar Minha Conta</button>
                            </div>
                        )}

                        {/* Mobile Date Selector */}
                        <div className="md:hidden flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 text-slate-500"><ArrowLeft size={20} /></button>
                            <h2 className="text-sm font-black capitalize text-slate-700 dark:text-slate-200">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 text-slate-500"><ArrowRight size={20} /></button>
                        </div>

                        {ui.view === 'dashboard' && (
                            <div className={`${DENSITY_CLASSES.spacing[ui.layoutDensity as keyof typeof DENSITY_CLASSES.spacing] || 'space-y-6'} animate-fade-in-up`}>
                                <Dashboard stats={monthlyData} density={ui.layoutDensity} userProfile={userProfile} />
                                
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2">
                                        <Charts data={monthlyData.chartData} annualData={annualData} year={currentDate.getFullYear()} density={ui.layoutDensity} />
                                    </div>
                                    <div className="space-y-6">
                                        <FinancialHealth stats={monthlyData} density={ui.layoutDensity} />
                                        <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 ${DENSITY_CLASSES.cardPadding[ui.layoutDensity as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-6'}`}>
                                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-200"><PiggyBank className="text-cyan-500" /> Orçamentos</h3>
                                            <BudgetStatus budgets={budgets} monthlyExpenses={monthlyData.expenseByCategory} categories={categories} density={ui.layoutDensity} />
                                            <button onClick={() => ui.setIsBudgetModalOpen(true)} className="mt-6 w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-cyan-500 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all font-medium text-sm">Configurar Orçamentos</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {ui.view === 'transactions' && (
                            <div className={`${DENSITY_CLASSES.spacing[ui.layoutDensity as keyof typeof DENSITY_CLASSES.spacing] || 'space-y-6'} animate-fade-in-up`}>
                                <AnnualComparisonCard data={annualData} year={currentDate.getFullYear()} density={ui.layoutDensity} />
                                
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
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
                                            onDelete={(t: any) => ui.setDeleteConfirmation({ isOpen: true, transaction: t })}
                                            onStatusChange={handleStatusChange} 
                                            onRepeat={handleRepeatTransaction}
                                            density={ui.layoutDensity}
                                        />
                                    </CollapsibleWidget>
                                </div>

                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <CollapsibleWidget 
                                        title={`Recorrências Ativas`} 
                                        isCollapsed={ui.collapsedWidgets['recurring']} 
                                        onToggle={() => ui.setCollapsedWidgets((prev: any) => ({ ...prev, recurring: !prev.recurring }))}
                                        density={ui.layoutDensity}
                                    >
                                        <div className={DENSITY_CLASSES.cardPadding[ui.layoutDensity as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-6'}>
                                            <RecurringTransactions 
                                                transactions={transactions} 
                                                onDeleteRecurrence={(recurringId, description) => ui.setRecurrenceDeleteConfirmation({ isOpen: true, recurringId, description })} 
                                                density={ui.layoutDensity} 
                                            />
                                        </div>
                                    </CollapsibleWidget>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className={`lg:col-span-2 ${DENSITY_CLASSES.spacing[ui.layoutDensity as keyof typeof DENSITY_CLASSES.spacing] || 'space-y-6'}`}>
                                        <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 ${DENSITY_CLASSES.cardPadding[ui.layoutDensity as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-6'}`}>
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
                                            <TransactionList transactions={filteredMonthlyTransactions} onEdit={ui.handleOpenModal} onDelete={(t: any) => ui.setDeleteConfirmation({ isOpen: true, transaction: t })} onStatusChange={handleStatusChange} onRepeat={handleRepeatTransaction} density={ui.layoutDensity} />
                                        </div>
                                    </div>
                                    <div className={DENSITY_CLASSES.spacing[ui.layoutDensity as keyof typeof DENSITY_CLASSES.spacing] || 'space-y-6'}>
                                        <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 ${DENSITY_CLASSES.cardPadding[ui.layoutDensity as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-6'}`}>
                                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-200"><Clock className="text-cyan-500" /> Contas a Vencer</h3>
                                            <UpcomingBills bills={upcomingBills} onEdit={ui.handleOpenModal} onDelete={(t: any) => ui.setDeleteConfirmation({ isOpen: true, transaction: t })} onStatusChange={handleStatusChange} onRepeat={handleRepeatTransaction} density={ui.layoutDensity} />
                                        </div>
                                        
                                        <div className={`bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg ${DENSITY_CLASSES.cardPadding[ui.layoutDensity as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-6'} text-white`}>
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
                            <div className="animate-fade-in-up">
                                <CalendarView currentDate={currentDate} transactions={transactions} onDayClick={handleDayClick} density={ui.layoutDensity} />
                            </div>
                        )}
                    </div>
                </main>

                {/* Mobile Bottom Nav */}
                <BottomNav 
                    view={ui.view} 
                    setView={ui.setView} 
                    onOpenNewTransaction={() => ui.handleOpenModal()}
                    onOpenSettings={() => ui.setIsSettingsModalOpen(true)}
                />
            </div>

            {/* Modals */}
            {ui.isModalOpen && <TransactionModal onClose={() => ui.setIsModalOpen(false)} onSave={handleSaveTransaction} transaction={ui.editingTransaction} categories={categories} />}
            {ui.isBatchModalOpen && <BatchTransactionModal onClose={() => ui.setIsBatchModalOpen(false)} onSaveBatch={handleSaveBatchTransactions} categories={categories} />}
            {ui.isBudgetModalOpen && <BudgetModal onClose={() => ui.setIsBudgetModalOpen(false)} onSave={handleSaveBudgets} currentBudgets={budgets} categories={categories} />}
            {ui.isSettingsModalOpen && <SettingsModal onClose={() => ui.setIsSettingsModalOpen(false)} categories={categories} onSaveCategories={handleSaveSettings} density={ui.layoutDensity} onDensityChange={ui.setLayoutDensity} />}
            {ui.isReportModalOpen && <ReportModal onClose={() => ui.setIsReportModalOpen(false)} onGenerate={handleGenerateCustomReport} categories={categories} />}
            {ui.isAdminOpen && <AdminPanel onClose={() => ui.setIsAdminOpen(false)} />}
            {ui.isHelpOpen && <UserManual onClose={() => ui.setIsHelpOpen(false)} />}
            <DrillDownModal isOpen={ui.drillDown.isOpen} onClose={() => ui.setDrillDown({ ...ui.drillDown, isOpen: false })} title={ui.drillDown.title} transactions={ui.drillDown.transactions} onEdit={ui.handleOpenModal} onDelete={(t: any) => ui.setDeleteConfirmation({ isOpen: true, transaction: t })} onStatusChange={handleStatusChange} onRepeat={handleRepeatTransaction} density={ui.layoutDensity} />
            <DeleteConfirmationModal isOpen={ui.deleteConfirmation.isOpen} onClose={() => ui.setDeleteConfirmation({ isOpen: false, transaction: null })} onConfirm={handleDeleteTransaction} transaction={ui.deleteConfirmation.transaction} />
            <GenericConfirmationModal 
                isOpen={ui.genericConfirmation.isOpen} 
                onClose={() => ui.setGenericConfirmation({ ...ui.genericConfirmation, isOpen: false })} 
                onConfirm={ui.genericConfirmation.onConfirm}
                title={ui.genericConfirmation.title}
                message={ui.genericConfirmation.message}
                type={ui.genericConfirmation.type}
                confirmText={ui.genericConfirmation.confirmText}
            />
            
            {/* Recurrence Delete Confirmation Modal */}
            {ui.recurrenceDeleteConfirmation.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4 mb-6 text-red-500">
                            <div className="bg-red-100 dark:bg-red-500/10 p-3 rounded-full">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Excluir Recorrência?</h3>
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                            Você está prestes a excluir <span className="font-bold text-slate-800 dark:text-slate-200">todas as parcelas</span> da recorrência: <br/>
                            <span className="italic">"{ui.recurrenceDeleteConfirmation.description}"</span>.
                            <br/><br/>
                            Esta ação não pode ser desfeita. Deseja continuar?
                        </p>
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => ui.setRecurrenceDeleteConfirmation({ isOpen: false, recurringId: null, description: '' })}
                                className="px-6 py-2.5 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => {
                                    handleDeleteRecurrence(ui.recurrenceDeleteConfirmation.recurringId);
                                    ui.setRecurrenceDeleteConfirmation({ isOpen: false, recurringId: null, description: '' });
                                }}
                                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all"
                            >
                                Sim, Excluir Tudo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
