import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export const APP_ID = 'meu-controle-financeiro';

function loadServiceAccount() {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT não configurado nas variáveis de ambiente do servidor.');
    }
    return JSON.parse(raw);
}

function getAdminApp(): App {
    const existing = getApps()[0];
    if (existing) return existing;
    return initializeApp({ credential: cert(loadServiceAccount()) });
}

const app = getAdminApp();

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
