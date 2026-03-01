import { useState, useEffect } from 'react';
import { INITIAL_WIDGET_ORDER } from '../constants';

export const useUIManager = (initialSettings: any = {}) => {
    const [theme, setTheme] = useState(initialSettings.theme || localStorage.getItem('theme') || 'light');
    const [view, setView] = useState('dashboard');
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [widgetOrder, setWidgetOrder] = useState(INITIAL_WIDGET_ORDER);
    const [layoutDensity, setLayoutDensity] = useState(initialSettings.layoutDensity || localStorage.getItem('layoutDensity') || 'normal');
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

    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('layoutDensity', layoutDensity);
    }, [layoutDensity]);

    const handleOpenModal = (transaction = null) => { setEditingTransaction(transaction); setIsModalOpen(true); };

    return {
        theme, setTheme,
        view, setView, widgetOrder, setWidgetOrder, layoutDensity, setLayoutDensity, hideZeroRows, setHideZeroRows,
        collapsedWidgets, setCollapsedWidgets, isModalOpen, setIsModalOpen, isBatchModalOpen, setIsBatchModalOpen,
        isBudgetModalOpen, setIsBudgetModalOpen, isReportModalOpen, setIsReportModalOpen, isSettingsModalOpen,
        setIsSettingsModalOpen, editingTransaction, setEditingTransaction, drillDown, setDrillDown, deleteConfirmation,
        setDeleteConfirmation, handleOpenModal, expenseGrouping, setExpenseGrouping, incomeGrouping, setIncomeGrouping,
        isHelpOpen, setIsHelpOpen, isAdminOpen, setIsAdminOpen
    };
};
