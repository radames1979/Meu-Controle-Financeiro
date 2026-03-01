export const INITIAL_CATEGORIES = {
    expense: ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Compras', 'Serviços', 'Dívidas', 'Impostos', 'Outros'],
    income: ['Salário', 'Investimentos', 'Freelance', 'Vendas', 'Presentes', 'Reembolsos', 'Outros']
};

export const MOCK_TRANSACTIONS = [
    { id: 'demo-1', type: 'income', description: 'Salário Mensal', amount: 5500, category: 'Salário', date: new Date().toISOString().split('T')[0], status: 'paid', account: 'Conta Corrente' },
    { id: 'demo-2', type: 'expense', description: 'Aluguel Apartamento', amount: 1500, category: 'Moradia', date: new Date().toISOString().split('T')[0], status: 'paid', account: 'Conta Corrente' },
    { id: 'demo-3', type: 'expense', description: 'Supermercado Mensal', amount: 850, category: 'Alimentação', date: new Date().toISOString().split('T')[0], status: 'paid', account: 'Cartão de Crédito' },
    { id: 'demo-4', type: 'expense', description: 'Energia Elétrica', amount: 220, category: 'Moradia', date: new Date().toISOString().split('T')[0], status: 'paid', account: 'Conta Corrente' },
    { id: 'demo-5', type: 'expense', description: 'Internet Fibra', amount: 120, category: 'Serviços', date: new Date().toISOString().split('T')[0], status: 'paid', account: 'Conta Corrente' },
    { id: 'demo-6', type: 'expense', description: 'Combustível Carro', amount: 350, category: 'Transporte', date: new Date().toISOString().split('T')[0], status: 'paid', account: 'Cartão de Crédito' },
    { id: 'demo-7', type: 'expense', description: 'Jantar Fora', amount: 180, category: 'Lazer', date: new Date().toISOString().split('T')[0], status: 'paid', account: 'Cartão de Crédito' },
    { id: 'demo-8', type: 'expense', description: 'Academia Mensal', amount: 110, category: 'Saúde', date: new Date().toISOString().split('T')[0], status: 'paid', account: 'Cartão de Crédito' },
    { id: 'demo-9', type: 'expense', description: 'Assinatura Streaming', amount: 55, category: 'Lazer', date: new Date().toISOString().split('T')[0], status: 'paid', account: 'Cartão de Crédito' },
    { id: 'demo-10', type: 'expense', description: 'Farmácia', amount: 85, category: 'Saúde', date: new Date().toISOString().split('T')[0], status: 'paid', account: 'Carteira' },
    { id: 'demo-11', type: 'expense', description: 'Padaria', amount: 35, category: 'Alimentação', date: new Date().toISOString().split('T')[0], status: 'paid', account: 'Carteira' },
    { id: 'demo-12', type: 'income', description: 'Salário Mensal', amount: 5500, category: 'Salário', date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 5).toISOString().split('T')[0], status: 'paid', account: 'Conta Corrente' },
    { id: 'demo-13', type: 'expense', description: 'Aluguel Apartamento', amount: 1500, category: 'Moradia', date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0], status: 'paid', account: 'Conta Corrente' },
    { id: 'demo-14', type: 'expense', description: 'Supermercado Mensal', amount: 920, category: 'Alimentação', date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 10).toISOString().split('T')[0], status: 'paid', account: 'Cartão de Crédito' },
    { id: 'demo-15', type: 'expense', description: 'Manutenção Carro', amount: 450, category: 'Transporte', date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15).toISOString().split('T')[0], status: 'paid', account: 'Conta Corrente' },
    { id: 'demo-16', type: 'expense', description: 'Cinema e Pipoca', amount: 85, category: 'Lazer', date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 20).toISOString().split('T')[0], status: 'paid', account: 'Carteira' },
    { id: 'demo-17', type: 'income', description: 'Venda de Itens Usados', amount: 200, category: 'Outros', date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 25).toISOString().split('T')[0], status: 'paid', account: 'Carteira' },
];

export const APP_CONFIG = {
    adminEmail: 'messi@bol.com.br',
    supportEmail: 'messi@bol.com.br',
    supportWhatsapp: '47992126402',
    pixKey: 'messi@bol.com.br',
    defaultPrice: 9.99,
    sponsors: [
        { name: 'Patrocinador 1', logo: 'https://placehold.co/150x60/e2e8f0/64748b?text=Patrocinador1' },
        { name: 'Patrocinador 2', logo: 'https://placehold.co/150x60/e2e8f0/64748b?text=Patrocinador2' },
        { name: 'Patrocinador 3', logo: 'https://placehold.co/150x60/e2e8f0/64748b?text=Patrocinador3' },
        { name: 'Patrocinador 4', logo: 'https://placehold.co/150x60/e2e8f0/64748b?text=Patrocinador4' }
    ]
};

export const ACCOUNT_TYPES = ['Carteira', 'Conta Corrente', 'Cartão de Crédito', 'Poupança'];

export const INITIAL_WIDGET_ORDER = ['upcoming_bills', 'dashboard', 'budgets', 'charts', 'monthly_transactions', 'annual_balance', 'annual_reports'];

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0', '#546E7A', '#26a69a'];

export const STATUSES = {
    WAITING: 'waiting',
    CONFIRMED: 'confirmed',
    PAID: 'paid'
};

export const PAYMENT_CODE_TYPES = ['Nenhum', 'Código de Barras', 'Pix (Copia e Cola)', 'Pix (Chave Aleatória)', 'Pix (CPF/CNPJ)', 'Pix (Email)', 'Pix (Celular)'];

export const YOUR_CONTACT_EMAIL = "messi@bol.com.br";

export const DENSITY_CLASSES = {
    spacing: { 'super-compact': 'space-y-1', compact: 'space-y-2', normal: 'space-y-4', relaxed: 'space-y-6', 'super-relaxed': 'space-y-8' },
    padding: { 'super-compact': 'p-2', compact: 'p-3', normal: 'p-4', relaxed: 'p-6', 'super-relaxed': 'p-8' },
    heroPadding: { 'super-compact': 'p-4 md:p-6', compact: 'p-5 md:p-8', normal: 'p-6 md:p-10', relaxed: 'p-8 md:p-12', 'super-relaxed': 'p-10 md:p-16' },
    itemPadding: { 'super-compact': 'p-1.5', compact: 'p-2', normal: 'p-3', relaxed: 'p-4', 'super-relaxed': 'p-5' },
    cardPadding: { 'super-compact': 'p-3', compact: 'p-4', normal: 'p-6', relaxed: 'p-7', 'super-relaxed': 'p-8' },
    dashboardPadding: { 'super-compact': 'p-4', compact: 'p-6', normal: 'p-8', relaxed: 'p-10', 'super-relaxed': 'p-12' }
};
