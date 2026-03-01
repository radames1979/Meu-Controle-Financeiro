import React, { useMemo } from 'react';
import { DENSITY_CLASSES } from '../constants';

export const CalendarView = ({ currentDate, transactions, onDayClick, density }: any) => {
    const paddingClass = DENSITY_CLASSES.cardPadding[density as keyof typeof DENSITY_CLASSES.cardPadding] || 'p-4';
    const dayHeight = density === 'super-compact' ? 'h-20' : density === 'compact' ? 'h-24' : density === 'relaxed' ? 'h-40' : density === 'super-relaxed' ? 'h-48' : 'h-32';
    
    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = [];
        let currentDay = new Date(firstDayOfMonth);
        let startingDayOfWeek = firstDayOfMonth.getDay();
        startingDayOfWeek = (startingDayOfWeek === 0) ? 6 : startingDayOfWeek - 1;

        for (let i = 0; i < startingDayOfWeek; i++) {
            daysInMonth.push({ date: null, isPlaceholder: true });
        }
        while (currentDay <= lastDayOfMonth) {
            const dateStr = currentDay.toISOString().split('T')[0];
            const dayTransactions = transactions.filter((t: any) => t.date === dateStr);
            const income = dayTransactions.filter((t: any) => t.type === 'income').reduce((acc: any, t: any) => acc + t.amount, 0);
            const expense = dayTransactions.filter((t: any) => t.type === 'expense').reduce((acc: any, t: any) => acc + t.amount, 0);
            daysInMonth.push({ date: new Date(currentDay), isPlaceholder: false, transactions: dayTransactions, balance: income - expense });
            currentDay.setDate(currentDay.getDate() + 1);
        }
        return daysInMonth;
    }, [currentDate, transactions]);

    const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    return (
        <div className={`bg-white dark:bg-slate-800 ${paddingClass} rounded-lg shadow-md border border-slate-200 dark:border-slate-700`}>
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-500 dark:text-slate-400 text-sm mb-2">
                {weekDays.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {calendarData.map((day, index) => (
                    <div key={index} className={`border border-slate-100 dark:border-slate-700 rounded-md ${dayHeight} flex flex-col p-1 ${day.isPlaceholder ? 'bg-slate-50 dark:bg-slate-900/20' : 'cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-900/20'}`} onClick={() => !day.isPlaceholder && onDayClick(day.date)} >
                        {!day.isPlaceholder && (
                            <>
                                <span className="font-bold text-slate-600 dark:text-slate-300 text-sm">{day.date.getDate()}</span>
                                <div className="flex-grow overflow-y-auto text-xs mt-1 space-y-1 no-scrollbar">
                                    {day.transactions.map((t: any) => (
                                        <div key={t.id} className={`p-1 rounded text-white truncate ${t.type === 'income' ? 'bg-blue-500' : 'bg-red-500'}`}>{t.description}</div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
