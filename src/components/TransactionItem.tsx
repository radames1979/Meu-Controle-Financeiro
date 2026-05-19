import { Clock, Check, CheckCircle2, Repeat, Edit, Copy, Trash2 } from 'lucide-react';
import { STATUSES, DENSITY_CLASSES } from '../constants';

export const TransactionItem = ({ transaction, onEdit, onDelete, onStatusChange, onRepeat, density }: any) => {
    const { id, type, description, date, amount, status, paymentCodeType, recurringId, installmentNumber, totalInstallments } = transaction;
    
    const itemPadding = density === 'super-compact' ? 'p-1.5' : density === 'compact' ? 'p-2' : density === 'relaxed' ? 'p-4' : density === 'super-relaxed' ? 'p-5' : 'p-3';
    const indicatorHeight = density === 'super-compact' ? 'h-6' : density === 'compact' ? 'h-8' : 'h-10';
    const textSize = density === 'super-compact' ? 'text-xs' : 'text-sm';
    const titleSize = density === 'super-compact' ? 'text-sm' : 'font-semibold text-slate-700 dark:text-slate-200';

    const getStatusIndicatorClass = (s: string) => {
        if (s === STATUSES.PAID) return 'bg-green-500';
        if (s === STATUSES.CONFIRMED) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getStatusIconColor = (s: string, active: boolean) => {
        if (!active) return 'text-slate-300 dark:text-slate-600 hover:text-cyan-500';
        if (s === STATUSES.PAID) return 'text-green-500 bg-green-50 dark:bg-green-500/10';
        if (s === STATUSES.CONFIRMED) return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10';
        return 'text-red-500 bg-red-50 dark:bg-red-500/10';
    };

    const PaymentIcon = ({ type }: any) => {
        if (type?.includes('Pix')) return <div className="p-1 px-1.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400">PIX</div>;
        if (type === 'Código de Barras') return <div className="p-1 px-1.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400">BOLETO</div>;
        return null;
    };

    return (
        <li className={`flex flex-col sm:flex-row sm:items-center justify-between ${itemPadding} rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 last:border-b-0 group transition-all duration-200 ${status === STATUSES.WAITING ? 'bg-yellow-50/30 dark:bg-yellow-500/5' : ''}`}>
            <div className="flex flex-grow items-center cursor-pointer mb-3 sm:mb-0" onClick={() => onEdit(transaction)}>
                <div className={`flex-shrink-0 w-1.5 ${indicatorHeight} rounded-full mr-4 bg-slate-200 dark:bg-slate-700 relative overflow-hidden`}>
                    <div className={`absolute w-full h-full rounded-full ${getStatusIndicatorClass(status)} transition-colors duration-300`} />
                </div>
                <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className={`${titleSize} truncate`}>
                            {description}
                        </p>
                        <div className="flex items-center gap-1.5">
                            {installmentNumber && totalInstallments && (
                                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                    {installmentNumber}/{totalInstallments}
                                </span>
                            )}
                            <PaymentIcon type={paymentCodeType} />
                            {recurringId && <Repeat size={12} className="text-cyan-500" />}
                        </div>
                    </div>
                    <p className={`${textSize} text-slate-400 dark:text-slate-500 font-medium`}>
                        {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-2">
                <p className={`font-black text-right sm:mr-4 ${textSize} ${type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {type === 'income' ? '+' : '-'} {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                
                <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-xl opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                    <div className="flex items-center border-r border-slate-200 dark:border-slate-700 pr-1 mr-1">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onStatusChange(id, STATUSES.WAITING); }} 
                            className={`p-1.5 rounded-lg transition-all ${getStatusIconColor(STATUSES.WAITING, status === STATUSES.WAITING)}`}
                            title="Aguardando"
                        >
                            <Clock size={14} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onStatusChange(id, STATUSES.CONFIRMED); }} 
                            className={`p-1.5 rounded-lg transition-all ${getStatusIconColor(STATUSES.CONFIRMED, status === STATUSES.CONFIRMED)}`}
                            title="Confirmado"
                        >
                            <Check size={14} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onStatusChange(id, STATUSES.PAID); }} 
                            className={`p-1.5 rounded-lg transition-all ${getStatusIconColor(STATUSES.PAID, status === STATUSES.PAID)}`}
                            title={type === 'income' ? 'Recebido' : 'Pago'}
                        >
                            <CheckCircle2 size={14} />
                        </button>
                    </div>
                    
                    <button onClick={(e) => { e.stopPropagation(); onEdit(transaction); }} className="text-slate-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 p-2 rounded-lg transition-colors" title="Editar">
                        <Edit size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onRepeat(transaction); }} className="text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 p-2 rounded-lg transition-colors" title="Repetir no próximo mês">
                        <Copy size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(transaction); }} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-lg transition-colors" title="Excluir">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </li>
    );
};
