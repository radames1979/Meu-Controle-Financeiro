import React from 'react';
import { HelpCircle, X, PlusCircle, Calendar, PieChart as PieChartIcon, Settings } from 'lucide-react';

export const UserManual = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-cyan-500 text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2"><HelpCircle /> Manual do Usuário</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition"><X /></button>
                </div>
                <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2"><PlusCircle className="text-cyan-500" /> 1. Primeiros Passos</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                            Para começar, use o botão <strong>"Nova Transação"</strong> no topo da tela. Você pode registrar tanto Receitas (dinheiro que entra) quanto Despesas (dinheiro que sai). 
                            Escolha uma categoria e defina se o pagamento já foi realizado ou se está pendente.
                        </p>
                    </section>
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2"><Calendar className="text-cyan-500" /> 2. Calendário e Vencimentos</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                            O widget de <strong>"Próximas Contas"</strong> mostra tudo o que vence nos próximos dias. Ative as notificações no ícone de sino para receber alertas automáticos e evitar multas.
                        </p>
                    </section>
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2"><PieChartIcon className="text-cyan-500" /> 3. Gráficos e Saúde Financeira</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                            Acompanhe sua <strong>Saúde Financeira</strong> no widget lateral. Ele calcula sua taxa de poupança mensal. Se estiver acima de 20%, você está em uma excelente posição!
                        </p>
                    </section>
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2"><Settings className="text-cyan-500" /> 4. Personalização</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                            Nas <strong>Configurações</strong>, você pode ajustar a densidade do layout (mais compacto ou mais espaçoso), gerenciar categorias e definir orçamentos mensais para cada categoria.
                        </p>
                    </section>
                </div>
                <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                    <button onClick={onClose} className="bg-cyan-500 text-white px-8 py-2 rounded-xl font-bold hover:bg-cyan-600 transition shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20">Entendi!</button>
                </div>
            </div>
        </div>
    );
};
