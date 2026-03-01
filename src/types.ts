export interface Transaction {
    id?: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    category: string;
    date: string;
    status?: string;
    account: string;
    paymentCodeType?: string | null;
    paymentCode?: string | null;
    isRecurring?: boolean;
    frequency?: string;
    recurrences?: number;
    installmentNumber?: number;
    totalInstallments?: number;
    recurringId?: string | null;
}

export interface UserProfile {
    uid: string;
    email: string;
    licenseStatus: 'active' | 'pending' | 'revoked';
    tutorialCompleted: boolean;
    createdAt: string;
    isDemo?: boolean;
    uiSettings?: {
        theme: string;
        layoutDensity: string;
    };
}

export interface AppConfig {
    adminEmail: string;
    supportEmail: string;
    supportWhatsapp: string;
    pixKey: string;
    defaultPrice: number;
    sponsors: Array<{ name: string; logo: string }>;
}

export interface Categories {
    expense: string[];
    income: string[];
}
