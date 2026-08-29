import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { 
    DollarSign, ShieldCheck, HelpCircle, Bell, BellOff, Printer, Layers, 
    PlusCircle, Settings, LogOut, ArrowLeft, ArrowRight, PiggyBank, Table, 
    Search, Clock, Star, EyeOff, Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
    collection, doc, addDoc, updateDoc, deleteDoc, writeBatch, setDoc,
    handleFirestoreError, OperationType 
} from '../services/firebase';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useDataManagement } from '../hooks/useDataManagement';
import { useUIManager } from '../hooks/useUIManager';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { LazyWidget, SkeletonBlock } from './LazyWidget';
import { DeveloperFooter } from './DeveloperFooter';
import { STATUSES, DENSITY_CLASSES } from '../constants';
import { registerFCMToken } from '../services/fcm';

// Lazy Loaded Components
const Dashboard = lazy(() => import('./Dashboard').then(m => ({ default: m.Dashboard })));
const FinancialHealth = lazy(() => import('./FinancialHealth').then(m => ({ default: m.FinancialHealth })));
const Charts = lazy(() => import('./Charts').then(m => ({ default: m.Charts })));
const AnnualBalanceTable = lazy(() => import('./AnnualBalanceTable').then(m => ({ default: m.AnnualBalanceTable })));
const TransactionList = lazy(() => import('./TransactionList').then(m => ({ default: m.TransactionList })));
const CollapsibleWidget = lazy(() => import('./CollapsibleWidget').then(m => ({ default: m.CollapsibleWidget })));
const TransactionModal = lazy(() => import('./TransactionModal').then(m => ({ default: m.TransactionModal })));
const BatchTransactionModal = lazy(() => import('./BatchTransactionModal').then(m => ({ default: m.BatchTransactionModal })));
const DrillDownModal = lazy(() => import('./DrillDownModal').then(m => ({ default: m.DrillDownModal })));
const CalendarView = lazy(() => import('./CalendarView').then(m => ({ default: m.CalendarView })));
const BudgetStatus = lazy(() => import('./BudgetStatus').then(m => ({ default: m.BudgetStatus })));
const BudgetModal = lazy(() => import('./BudgetModal').then(m => ({ default: m.BudgetModal })));
const DeleteConfirmationModal = lazy(() => import('./DeleteConfirmationModal').then(m => ({ default: m.DeleteConfirmationModal })));
const UpcomingBills = lazy(() => import('./UpcomingBills').then(m => ({ default: m.UpcomingBills })));
const ReportModal = lazy(() => import('./ReportModal').then(m => ({ default: m.ReportModal })));
const SettingsModal = lazy(() => import('./SettingsModal').then(m => ({ default: m.SettingsModal })));
const AdminPanel = lazy(() => import('./AdminPanel').then(m => ({ default: m.AdminPanel })));
const UserManual = lazy(() => import('./UserManual').then(m => ({ default: m.UserManual })));
const RecurringTransactions = lazy(() => import('./RecurringTransactions').then(m => ({ default: m.RecurringTransactions })));
const GenericConfirmationModal = lazy(() => import('./GenericConfirmationModal').then(m => ({ default: m.GenericConfirmationModal })));
const AnnualComparisonCard = lazy(() => import('./AnnualComparisonCard').then(m => ({ default: m.AnnualComparisonCard })));
const BudgetAlertsWidget = lazy(() => import('./BudgetAlertsWidget').then(m => ({ default: m.BudgetAlertsWidget })));
const ChangelogModal = lazy(() => import('./ChangelogModal').then(m => ({ default: m.ChangelogModal })));

export const DashboardApp = ({ user, db, onLogout, userProfile, onUpdateProfile, isDemo, isAdmin, sessionTimeout, onSessionTimeoutChange, notificationAdvance, onNotificationAdvanceChange }: any) => {
    if (!user) return null;
    const { transactions, setTransactions, budgets, setBudgets, categories, setCategories } = useDataManagement(db, user.uid, isDemo);
    const ui = useUIManager(userProfile?.uiSettings);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isChangelogOpen, setIsChangelogOpen] = useState(false);

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
        const paid = filtered.filter(t => t.status === STATUSES.PAID).reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
        const confirmed = filtered.filter(t => t.status === STATUSES.CONFIRMED).reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
        const waiting = filtered.filter(t => t.status === STATUSES.WAITING).reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
        return { filtered, income, expense, balance, chartData, expenseByCategory, paid, confirmed, waiting };
    }, [transactions, currentDate]);

    const prevMonthData = useMemo(() => {
        let prevYear = currentDate.getFullYear();
        let prevMonth = currentDate.getMonth() - 1;
        if (prevMonth < 0) {
            prevMonth = 11;
            prevYear -= 1;
        }
        const filtered = transactions.filter(t => {
            const d = new Date(t.date + 'T00:00:00');
            return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
        });
        const income = filtered.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = filtered.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const balance = income - expense;
        return { income, expense, balance };
    }, [transactions, currentDate]);

    const upcomingBills = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const unpaid = transactions.filter(t => t.status !== STATUSES.PAID && t.date);
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

        const path = `artifacts/${appId}/users/${user.uid}/transactions`;
        try {
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
                        status: STATUSES.WAITING
                    });
                }
                await batch.commit();
                toast.success(`${recurrences} parcelas geradas com sucesso!`);
            } else {
                await addDoc(colRef, payload);
                toast.success('Transação adicionada!');
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
        }
        ui.setIsModalOpen(false);
    };

    const handleSaveBatchTransactions = async (batchData: any[]) => {
        if (isDemo) {
            const newTransactions = batchData.map(item => ({ 
                ...item, 
                id: `demo-${Math.random().toString(36).substr(2, 9)}`,
                status: STATUSES.WAITING 
            }));
            setTransactions([...transactions, ...newTransactions]);
            ui.setIsBatchModalOpen(false);
            toast.success(`${batchData.length} transações salvas (Demo)!`);
            return;
        }
        const appId = 'meu-controle-financeiro';
        const path = `artifacts/${appId}/users/${user.uid}/transactions`;
        try {
            const batch = writeBatch(db);
            batchData.forEach(item => {
                const { id, ...payload } = item;
                const newDocRef = doc(collection(db, path));
                batch.set(newDocRef, { ...payload, status: STATUSES.WAITING });
            });
            await batch.commit();
            ui.setIsBatchModalOpen(false);
            toast.success(`${batchData.length} transações salvas!`);
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
        }
    };

    const handleDeleteTransaction = async (transaction: any) => {
        if (isDemo) {
            setTransactions(transactions.filter(t => t.id !== transaction.id));
            ui.setDeleteConfirmation({ isOpen: false, transaction: null });
            toast.success('Transação removida (Demo).');
            return;
        }
        const appId = 'meu-controle-financeiro';
        const path = `artifacts/${appId}/users/${user.uid}/transactions/${transaction.id}`;
        try {
            await deleteDoc(doc(db, path));
            ui.setDeleteConfirmation({ isOpen: false, transaction: null });
            toast.success('Transação removida.');
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, path);
        }
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
        const path = `artifacts/${appId}/users/${user.uid}/transactions`;
        try {
            const batch = writeBatch(db);
            toDelete.forEach(t => {
                batch.delete(doc(db, path, t.id));
            });
            await batch.commit();
            toast.success('Recorrência completa removida.');
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, path);
        }
    };

    const handleStatusChange = async (id: string, targetStatus?: string) => {
        const t = transactions.find(t => t.id === id);
        if (!t) return;
        
        const nextStatus = targetStatus || (t.status === STATUSES.WAITING ? STATUSES.CONFIRMED : t.status === STATUSES.CONFIRMED ? STATUSES.PAID : STATUSES.WAITING);
        
        if (nextStatus === t.status) return;

        const performChange = async () => {
            if (isDemo) {
                setTransactions(transactions.map(item => item.id === id ? { ...item, status: nextStatus } : item));
                toast.success(`Status atualizado para ${nextStatus} (Demo)!`);
                return;
            }
            const appId = 'meu-controle-financeiro';
            const path = `artifacts/${appId}/users/${user.uid}/transactions/${id}`;
            try {
                await updateDoc(doc(db, path), { status: nextStatus });
                toast.success(`Status atualizado para ${nextStatus}!`);
            } catch (error) {
                handleFirestoreError(error, OperationType.UPDATE, path);
            }
        };

        if (nextStatus === STATUSES.PAID && t.status !== STATUSES.PAID) {
            const isIncome = t.type === 'income';
            ui.setGenericConfirmation({
                isOpen: true,
                title: isIncome ? 'Confirmar Recebimento?' : 'Confirmar Pagamento?',
                message: `Deseja marcar a transação "${t.description}" como ${isIncome ? 'RECEBIDA' : 'PAGA'}?`,
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
                status: STATUSES.WAITING,
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
            const isGranted = Notification.permission === 'granted';
            const localPref = localStorage.getItem('notifications_pref') !== 'disabled';
            setNotificationsEnabled(isGranted && localPref);
        }
    }, []);

    const checkUpcomingBillsNotifications = (bills: any[]) => {
        if (Notification.permission !== 'granted') return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const advanceDays = parseInt(notificationAdvance || '3', 10);
        const advanceLimitDate = new Date();
        advanceLimitDate.setDate(today.getDate() + advanceDays);

        bills.forEach(bill => {
            const billDate = new Date(bill.date + 'T00:00:00');
            if (billDate >= today && billDate <= advanceLimitDate && bill.status !== STATUSES.PAID) {
                const daysLeft = Math.ceil((billDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const title = daysLeft === 0 ? 'Conta vence HOJE!' : `Conta vence em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`;
                
                new Notification(title, {
                    body: `${bill.description}: ${bill.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
                    icon: '/favicon.ico'
                });
            }
        });
    };

    const toggleNotifications = async () => {
        if (!('Notification' in window)) {
            toast.error('Neste navegador, as notificações de sistema não são suportadas.');
            return;
        }

        if (Notification.permission === 'denied') {
            toast.error('Permissão de notificações negada nas configurações do navegador.');
            return;
        }

        if (Notification.permission === 'granted') {
            const nextPref = !notificationsEnabled;
            setNotificationsEnabled(nextPref);
            localStorage.setItem('notifications_pref', nextPref ? 'enabled' : 'disabled');
            if (nextPref) {
                toast.success('Notificações de contas ativadas!');
                const allBills = [...(upcomingBills.overdue || []), ...(upcomingBills.dueToday || []), ...(upcomingBills.dueNext7Days || [])];
                if (allBills.length > 0) {
                    checkUpcomingBillsNotifications(allBills);
                } else {
                    new Notification('Plano Raiz', {
                        body: 'Você ativou as notificações com sucesso. Não há contas vencendo hoje ou nos próximos dias!',
                        icon: '/favicon.ico'
                    });
                }
            } else {
                toast.success('Notificações desativadas temporariamente.');
            }
        } else {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotificationsEnabled(true);
                localStorage.setItem('notifications_pref', 'enabled');
                toast.success('Notificações ativadas! Avisaremos você sobre contas a vencer.');
                
                const allBills = [...(upcomingBills.overdue || []), ...(upcomingBills.dueToday || []), ...(upcomingBills.dueNext7Days || [])];
                if (allBills.length > 0) {
                    checkUpcomingBillsNotifications(allBills);
                } else {
                    new Notification('Plano Raiz', {
                        body: 'Você ativou as notificações com sucesso. Não há contas vencendo hoje ou nos próximos dias!',
                        icon: '/favicon.ico'
                    });
                }
            } else {
                setNotificationsEnabled(false);
                toast.error('Permissão de notificações recusada.');
            }
        }
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
    }, [upcomingBills, notificationsEnabled, notificationAdvance]);

    useEffect(() => {
        if (notificationsEnabled && user && !isDemo) {
            registerFCMToken(user.uid).catch(err => {
                console.warn("Silent background FCM registration skipped/blocked:", err);
            });
        }
    }, [notificationsEnabled, user, isDemo]);

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
        <div className={`h-full w-full flex transition-colors duration-300 ${ui.theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
            {/* Desktop Sidebar */}
            <Sidebar 
                view={ui.view} 
                setView={ui.setView} 
                isCollapsed={isSidebarCollapsed} 
                setIsCollapsed={setIsSidebarCollapsed}
                user={user}
                isAdmin={isAdmin}
                onLogout={onLogout}
                onOpenSettings={() => ui.setIsSettingsModalOpen(true)}
                onOpenHelp={() => ui.setIsHelpOpen(true)}
                onOpenAdmin={() => ui.setIsAdminOpen(true)}
                onOpenNewTransaction={() => ui.handleOpenModal()}
                onOpenBatch={() => ui.setIsBatchModalOpen(true)}
                onOpenReport={() => ui.setIsReportModalOpen(true)}
                onOpenChangelog={() => setIsChangelogOpen(true)}
            />

            <div className="flex-grow flex flex-col h-screen overflow-hidden relative">
                {/* Mobile Header */}
                <header className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 pt-[calc(env(safe-area-inset-top)+1rem)] flex justify-between items-center z-30">
                    <div className="flex items-center gap-2">
                        <div className="bg-cyan-500 p-1.5 rounded-lg text-white">
                            <DollarSign size={20} />
                        </div>
                        <h1 className="font-display font-bold text-slate-800 dark:text-white uppercase tracking-wide">Plano Raiz</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            id="mobile-notification-bell-btn"
                            onClick={toggleNotifications} 
                            className={`p-2 rounded-lg transition-colors duration-200 ${notificationsEnabled ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            title={notificationsEnabled ? "Notificações de Contas Ativadas" : "Ativar Notificações de Contas"}
                        >
                            {notificationsEnabled ? (
                                <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 5 }}>
                                    <Bell size={18} />
                                </motion.div>
                            ) : (
                                <BellOff size={18} />
                            )}
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
                            id="desktop-notification-bell-btn"
                            onClick={toggleNotifications} 
                            className={`p-2 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 relative ${
                                notificationsEnabled 
                                ? 'text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300' 
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                            title={notificationsEnabled ? "Desativar Notificações de Contas" : "Ativar Notificações de Contas"}
                        >
                            {notificationsEnabled ? (
                                <div className="relative">
                                    <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 4 }}>
                                        <Bell size={20} />
                                    </motion.div>
                                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                </div>
                            ) : (
                                <BellOff size={20} />
                            )}
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

                <main className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar pb-24 md:pb-8 touch-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
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
                                <Suspense fallback={<SkeletonBlock height="300px" />}>
                                    <Dashboard stats={monthlyData} prevMonthStats={prevMonthData} density={ui.layoutDensity} userProfile={userProfile} />
                                </Suspense>

                                <Suspense fallback={<SkeletonBlock height="100px" />}>
                                    <BudgetAlertsWidget
                                        budgets={budgets}
                                        monthlyExpenses={monthlyData.expenseByCategory}
                                        categories={categories}
                                        density={ui.layoutDensity}
                                        onDrillDown={(category) => {
                                            const title = `Lançamentos: ${category}`;
                                            const categoryTransactions = monthlyData.filtered.filter((t: any) => t.category === category);
                                            ui.setDrillDown({ isOpen: true, title, transactions: categoryTransactions });
                                        }}
                                        onAdjustBudget={() => ui.setIsBudgetModalOpen(true)}
                                    />
                                </Suspense>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2">
                                        <Suspense fallback={<SkeletonBlock height="400px" />}>
                                            <Charts data={monthlyData.chartData} annualData={annualData} year={currentDate.getFullYear()} density={ui.layoutDensity} theme={ui.theme} />
                                        </Suspense>
                                    </div>
                                    <div className="space-y-6">
                                        <Suspense fallback={<SkeletonBlock height="300px" />}>
                                            <FinancialHealth stats={monthlyData} density={ui.layoutDensity} />
                                        </Suspense>
                                        <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 ${DENSITY_CLASSES.cardPadding[ui.layoutDensity as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-6'}`}>
                                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-200"><PiggyBank className="text-cyan-500" /> Orçamentos</h3>
                                            <Suspense fallback={<SkeletonBlock height="150px" />}>
                                                <BudgetStatus budgets={budgets} monthlyExpenses={monthlyData.expenseByCategory} categories={categories} density={ui.layoutDensity} />
                                            </Suspense>
                                            <button onClick={() => ui.setIsBudgetModalOpen(true)} className="mt-6 w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-cyan-500 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all font-medium text-sm">Configurar Orçamentos</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {ui.view === 'transactions' && (
                            <div className={`${DENSITY_CLASSES.spacing[ui.layoutDensity as keyof typeof DENSITY_CLASSES.spacing] || 'space-y-6'} animate-fade-in-up`}>
                                <LazyWidget placeholderHeight="200px">
                                    <AnnualComparisonCard 
                                        data={annualData} 
                                        year={currentDate.getFullYear()} 
                                        density={ui.layoutDensity} 
                                        onEdit={ui.handleOpenModal}
                                        onDrillDown={(title, transactions) => ui.setDrillDown({ isOpen: true, title, transactions })}
                                    />
                                </LazyWidget>
                                
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <CollapsibleWidget 
                                        title={`Balanço Anual - ${currentDate.getFullYear()}`} 
                                        isCollapsed={ui.collapsedWidgets['annual']} 
                                        onToggle={() => ui.setCollapsedWidgets((prev: any) => ({ ...prev, annual: !prev.annual }))}
                                        density={ui.layoutDensity}
                                    >
                                        <LazyWidget placeholderHeight="400px">
                                            <AnnualBalanceTable 
                                                data={annualData} 
                                                year={currentDate.getFullYear()} 
                                                onEdit={ui.handleOpenModal} 
                                                onDelete={(t: any) => ui.setDeleteConfirmation({ isOpen: true, transaction: t })}
                                                onStatusChange={handleStatusChange} 
                                                onRepeat={handleRepeatTransaction}
                                                density={ui.layoutDensity}
                                            />
                                        </LazyWidget>
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
                                            <LazyWidget placeholderHeight="150px">
                                                <RecurringTransactions 
                                                    transactions={transactions} 
                                                    onDeleteRecurrence={(recurringId, description) => ui.setRecurrenceDeleteConfirmation({ isOpen: true, recurringId, description })} 
                                                    density={ui.layoutDensity} 
                                                />
                                            </LazyWidget>
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
                                            <LazyWidget placeholderHeight="500px">
                                                <TransactionList transactions={filteredMonthlyTransactions} onEdit={ui.handleOpenModal} onDelete={(t: any) => ui.setDeleteConfirmation({ isOpen: true, transaction: t })} onStatusChange={handleStatusChange} onRepeat={handleRepeatTransaction} density={ui.layoutDensity} />
                                            </LazyWidget>
                                        </div>
                                    </div>
                                    <div className={DENSITY_CLASSES.spacing[ui.layoutDensity as keyof typeof DENSITY_CLASSES.spacing] || 'space-y-6'}>
                                        <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 ${DENSITY_CLASSES.cardPadding[ui.layoutDensity as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-6'}`}>
                                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-200"><Clock className="text-cyan-500" /> Contas a Vencer</h3>
                                            <LazyWidget placeholderHeight="300px">
                                                <UpcomingBills bills={upcomingBills} onEdit={ui.handleOpenModal} onDelete={(t: any) => ui.setDeleteConfirmation({ isOpen: true, transaction: t })} onStatusChange={handleStatusChange} onRepeat={handleRepeatTransaction} density={ui.layoutDensity} />
                                            </LazyWidget>
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
                                <LazyWidget placeholderHeight="600px">
                                    <CalendarView currentDate={currentDate} transactions={transactions} onDayClick={handleDayClick} density={ui.layoutDensity} />
                                </LazyWidget>
                            </div>
                        )}

                        {/* Rodapé de Créditos do Desenvolvedor */}
                        <DeveloperFooter className="mt-8 mb-16 md:mb-4" />
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
            <Suspense fallback={null}>
                {ui.isModalOpen && <TransactionModal onClose={() => ui.setIsModalOpen(false)} onSave={handleSaveTransaction} transaction={ui.editingTransaction} categories={categories} />}
                {ui.isBatchModalOpen && <BatchTransactionModal onClose={() => ui.setIsBatchModalOpen(false)} onSaveBatch={handleSaveBatchTransactions} categories={categories} />}
                {ui.isBudgetModalOpen && <BudgetModal onClose={() => ui.setIsBudgetModalOpen(false)} onSave={handleSaveBudgets} currentBudgets={budgets} categories={categories} monthlyExpenses={monthlyData.expenseByCategory} currentDate={currentDate} />}
                {ui.isSettingsModalOpen && <SettingsModal onClose={() => ui.setIsSettingsModalOpen(false)} user={user} categories={categories} onSaveCategories={handleSaveSettings} density={ui.layoutDensity} onDensityChange={ui.setLayoutDensity} sessionTimeout={sessionTimeout} onSessionTimeoutChange={onSessionTimeoutChange} notificationAdvance={notificationAdvance} onNotificationAdvanceChange={onNotificationAdvanceChange} onOpenChangelog={() => setIsChangelogOpen(true)} />}
                {ui.isReportModalOpen && <ReportModal onClose={() => ui.setIsReportModalOpen(false)} onGenerate={handleGenerateCustomReport} categories={categories} />}
                {ui.isAdminOpen && <AdminPanel onClose={() => ui.setIsAdminOpen(false)} />}
                {ui.isHelpOpen && <UserManual onClose={() => ui.setIsHelpOpen(false)} />}
                {isChangelogOpen && <ChangelogModal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} />}
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
            </Suspense>
            
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
