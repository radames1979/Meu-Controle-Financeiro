import React, { useState } from 'react';
import { PlusCircle, PiggyBank, Printer, LayoutDashboard } from 'lucide-react';

export const TutorialModal = ({ onClose }: { onClose: any }) => {
    const [step, setStep] = useState(0);
    const tutorialSteps = [
        {
            icon: <PlusCircle size={48} className="text-cyan-500" />,
            title: "1. Adicione sua primeira transação",
            text: "Clique no botão 'Nova Transação' no canto superior direito para registrar suas receitas e despesas. É rápido e fácil!"
        },
        {
            icon: <PiggyBank size={48} className="text-cyan-500" />,
            title: "2. Crie seus orçamentos",
            text: "Use o ícone do porquinho para definir limites de gastos mensais por categoria. Acompanhe seu progresso no widget de orçamentos."
        },
        {
            icon: <Printer size={48} className="text-cyan-500" />,
            title: "3. Gere relatórios",
            text: "Clique no ícone da impressora para gerar relatórios em PDF. Analise seus dados anuais e mensais de forma simples."
        },
        {
            icon: <LayoutDashboard size={48} className="text-cyan-500" />,
            title: "Tudo pronto!",
            text: "Explore o painel e organize suas finanças. Se precisar de ajuda, clique no ícone (❓) no cabeçalho. Bom controle!"
        }
    ];

    const currentStep = tutorialSteps[step];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center animate-fade-in-up border border-slate-200 dark:border-slate-700">
                <div className="mb-6 flex justify-center">{currentStep.icon}</div>
                <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">{currentStep.title}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">{currentStep.text}</p>
                <div className="flex justify-between items-center">
                    {step < tutorialSteps.length - 1 ? (
                        <button onClick={onClose} className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">Pular</button>
                    ) : <div></div>}
                    
                    {step < tutorialSteps.length - 1 ? (
                        <button onClick={() => setStep(s => s + 1)} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-8 rounded-xl transition shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20">Próximo</button>
                    ) : (
                        <button onClick={onClose} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">Começar a Usar!</button>
                    )}
                </div>
            </div>
        </div>
    );
};
