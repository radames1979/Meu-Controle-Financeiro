import React from 'react';
import { DollarSign, ArrowLeft } from 'lucide-react';
import { DeveloperFooter } from './DeveloperFooter';
import { YOUR_CONTACT_EMAIL } from '../constants';

interface Section {
    heading: string;
    paragraphs: string[];
}

const LAST_UPDATED = '30 de agosto de 2026';

const TERMS_SECTIONS: Section[] = [
    {
        heading: '1. Aceitação dos termos',
        paragraphs: [
            'Ao criar uma conta ou usar o Plano Raiz, você concorda com estes Termos de Uso e com a nossa Política de Privacidade. Se você não concorda com algum ponto, não deve usar o serviço.',
        ],
    },
    {
        heading: '2. O que é o Plano Raiz',
        paragraphs: [
            'O Plano Raiz é uma ferramenta de controle financeiro pessoal: você registra manualmente suas receitas, despesas, orçamentos e contas a vencer, e o app organiza essas informações em relatórios, gráficos e alertas.',
            'O Plano Raiz não se conecta automaticamente a bancos, cartões ou instituições financeiras. Todos os dados financeiros vêm do que você mesmo insere. Não somos uma instituição financeira, não damos consultoria de investimentos e não realizamos nenhuma transação em seu nome.',
        ],
    },
    {
        heading: '3. Cadastro e conta',
        paragraphs: [
            'Para usar o Plano Raiz além do Modo Demo, você precisa criar uma conta com e-mail e senha ou com sua conta Google. Você é responsável por manter suas credenciais em sigilo e por tudo que acontecer na sua conta.',
            'O serviço é destinado a maiores de 18 anos. Se você tiver entre 16 e 18 anos, o uso deve ser supervisionado por um responsável legal.',
        ],
    },
    {
        heading: '4. Preço e pagamento',
        paragraphs: [
            'O acesso completo ao Plano Raiz é vendido como licença vitalícia, com pagamento único via Pix, no valor exibido na tela de assinatura no momento da compra. Não há cobrança recorrente nem renovação automática.',
            'O pagamento é processado por um parceiro de pagamentos (atualmente, Asaas). Não armazenamos dados de cartão; no caso do Pix, o CPF/CNPJ informado é enviado diretamente ao processador de pagamento para emissão da cobrança.',
            'Conforme o artigo 49 do Código de Defesa do Consumidor, você tem direito de se arrepender da compra em até 7 (sete) dias corridos a partir do pagamento, com reembolso integral, bastando solicitar pelos canais de contato ao final desta página.',
        ],
    },
    {
        heading: '5. Uso aceitável',
        paragraphs: [
            'Você concorda em não usar o Plano Raiz para fins ilícitos, não tentar acessar contas de outros usuários, não tentar burlar as regras de segurança ou o sistema de cobrança, e não sobrecarregar o serviço de forma intencional.',
            'Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos.',
        ],
    },
    {
        heading: '6. Isenção de responsabilidade',
        paragraphs: [
            'O Plano Raiz é uma ferramenta de organização, não um serviço de aconselhamento financeiro, contábil ou de investimentos. As decisões financeiras que você toma com base nos relatórios do app são de sua exclusiva responsabilidade.',
            'Você é responsável pela exatidão dos dados que insere. Não nos responsabilizamos por erros de cálculo decorrentes de lançamentos incorretos feitos pelo usuário.',
            'Fazemos o possível para manter o serviço disponível, mas não garantimos disponibilidade ininterrupta. Manutenções, falhas de terceiros (como Firebase ou o processador de pagamento) ou casos fortuitos podem causar indisponibilidade temporária.',
        ],
    },
    {
        heading: '7. Propriedade intelectual',
        paragraphs: [
            'O código, design, marca e conteúdo do Plano Raiz pertencem ao seu desenvolvedor. Os dados financeiros que você insere pertencem a você; nós apenas os armazenamos para operar o serviço, conforme descrito na Política de Privacidade.',
        ],
    },
    {
        heading: '8. Cancelamento e exclusão de conta',
        paragraphs: [
            'Você pode solicitar o cancelamento e a exclusão da sua conta a qualquer momento pelos canais de contato abaixo. Como o acesso é vitalício (pagamento único), o cancelamento da conta não gera reembolso fora do prazo de arrependimento do item 4, salvo decisão em contrário do responsável pelo serviço.',
        ],
    },
    {
        heading: '9. Alterações nestes termos',
        paragraphs: [
            'Podemos atualizar estes Termos de Uso periodicamente. Mudanças relevantes serão comunicadas dentro do app ou por e-mail. O uso continuado do serviço após uma atualização representa a aceitação dos novos termos.',
        ],
    },
    {
        heading: '10. Legislação aplicável',
        paragraphs: [
            'Estes termos são regidos pelas leis do Brasil. Fica eleito o foro do domicílio do usuário consumidor para dirimir eventuais controvérsias, conforme o Código de Defesa do Consumidor.',
        ],
    },
];

const PRIVACY_SECTIONS: Section[] = [
    {
        heading: '1. Quem trata os seus dados',
        paragraphs: [
            'O Plano Raiz é operado por Radamés, responsável pelo desenvolvimento e funcionamento do serviço. Para qualquer assunto relacionado aos seus dados pessoais, use os canais de contato ao final desta página.',
        ],
    },
    {
        heading: '2. Quais dados coletamos',
        paragraphs: [
            'Dados de cadastro: e-mail e, se você entrar com o Google, o nome e a foto associados à sua conta Google.',
            'Dados financeiros que você mesmo insere: transações, valores, categorias, contas, orçamentos e lembretes de contas a vencer.',
            'Dados de pagamento: quando você gera uma cobrança Pix, seu CPF/CNPJ e e-mail são enviados ao nosso processador de pagamento (Asaas) para emissão da cobrança. Não armazenamos dados de cartão em nossos servidores.',
            'Dados técnicos: identificador do dispositivo para notificações push (se você ativar essa opção), data de criação da conta e último acesso.',
        ],
    },
    {
        heading: '3. Para que usamos esses dados',
        paragraphs: [
            'Para autenticar seu acesso, exibir e organizar seus dados financeiros dentro do app, processar seu pagamento e liberar sua licença automaticamente, enviar notificações de contas a vencer (se ativadas) e oferecer suporte quando você entra em contato.',
        ],
    },
    {
        heading: '4. Com quem compartilhamos dados',
        paragraphs: [
            'Google Firebase (Autenticação, banco de dados e notificações), hospedado em infraestrutura Google Cloud.',
            'Asaas, para processar a cobrança Pix.',
            'Vercel, que hospeda o site e as funções que dão suporte ao pagamento automático.',
            'Não vendemos, alugamos nem compartilhamos seus dados financeiros com anunciantes ou outros terceiros para fins de marketing.',
        ],
    },
    {
        heading: '5. Como protegemos seus dados',
        paragraphs: [
            'Cada conta só acessa os próprios dados, protegidos por regras de segurança no banco de dados que impedem qualquer usuário de ler ou alterar informações de outra conta. Os dados trafegam de forma criptografada (HTTPS) e ficam armazenados criptografados em repouso, no padrão do Google Cloud.',
            'O acesso administrativo ao painel de gestão é restrito a contas explicitamente autorizadas, verificadas pelo próprio Firebase.',
        ],
    },
    {
        heading: '6. Cookies e armazenamento local',
        paragraphs: [
            'Usamos o armazenamento local do seu navegador (localStorage) para lembrar preferências como densidade de layout e tempo de expiração de sessão. Não usamos cookies de rastreamento publicitário.',
        ],
    },
    {
        heading: '7. Seus direitos (LGPD)',
        paragraphs: [
            'Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você pode solicitar a qualquer momento: confirmação de que tratamos seus dados, acesso a eles, correção de dados incompletos ou desatualizados, exclusão dos seus dados, portabilidade e informação sobre com quem compartilhamos suas informações.',
            'Para exercer qualquer um desses direitos, entre em contato pelos canais abaixo. Respondemos em até 15 dias.',
        ],
    },
    {
        heading: '8. Retenção e exclusão',
        paragraphs: [
            'Mantemos seus dados enquanto sua conta estiver ativa. Ao solicitar a exclusão da conta, seus dados são removidos dos nossos sistemas em até 30 dias, ressalvado o que a lei exigir que guardemos por mais tempo (por exemplo, registros fiscais de pagamento).',
        ],
    },
    {
        heading: '9. Menores de idade',
        paragraphs: [
            'O Plano Raiz não é destinado a menores de 16 anos. Usuários entre 16 e 18 anos devem usar o serviço com supervisão de um responsável legal.',
        ],
    },
    {
        heading: '10. Alterações nesta política',
        paragraphs: [
            'Podemos atualizar esta Política de Privacidade periodicamente. Mudanças relevantes serão comunicadas dentro do app ou por e-mail.',
        ],
    },
];

export const LegalPage = ({ type, onBack }: { type: 'terms' | 'privacy'; onBack: () => void }) => {
    const isTerms = type === 'terms';
    const title = isTerms ? 'Termos de Uso' : 'Política de Privacidade';
    const sections = isTerms ? TERMS_SECTIONS : PRIVACY_SECTIONS;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-cyan-500 p-2 rounded-xl text-white">
                            <DollarSign size={20} />
                        </div>
                        <span className="font-display font-bold text-lg uppercase tracking-wide">Plano Raiz</span>
                    </div>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition"
                    >
                        <ArrowLeft size={16} /> Voltar
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-16">
                <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-black uppercase tracking-widest mb-6">
                    {isTerms ? 'Termos' : 'Privacidade'}
                </span>
                <h1 className="font-display font-bold text-4xl md:text-5xl uppercase tracking-wide mb-3">{title}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-12">Última atualização: {LAST_UPDATED}</p>

                <div className="space-y-10">
                    {sections.map((section, i) => (
                        <section key={i}>
                            <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{section.heading}</h2>
                            <div className="space-y-3">
                                {section.paragraphs.map((p, j) => (
                                    <p key={j} className="text-slate-600 dark:text-slate-400 leading-relaxed">{p}</p>
                                ))}
                            </div>
                        </section>
                    ))}

                    <section className="pt-6 border-t border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">Contato</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Dúvidas sobre {isTerms ? 'estes termos' : 'esta política'} ou sobre seus dados pessoais? Fale conosco em{' '}
                            <a href={`mailto:${YOUR_CONTACT_EMAIL}`} className="text-cyan-500 hover:underline font-bold">{YOUR_CONTACT_EMAIL}</a>.
                        </p>
                    </section>

                    <p className="text-xs text-slate-400 dark:text-slate-500 pt-4 italic">
                        Este documento é um modelo geral, elaborado para refletir o funcionamento real do Plano Raiz. Ele não substitui a orientação de um advogado; recomendamos revisão jurídica antes de considerá-lo definitivo, especialmente se o negócio crescer ou mudar de forma.
                    </p>
                </div>
            </main>

            <div className="max-w-3xl mx-auto px-6 pb-10">
                <DeveloperFooter />
            </div>
        </div>
    );
};
