import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

// Default VAPID key (public certificate for web push in Firebase Cloud Messaging)
// If the user has custom VAPID keys, they can also save them.
export const DEFAULT_VAPID_KEY = "BPMXshZ6N_aX-xG6s2-3eHe32_H2W8L_p6uR_7Vsh1-5yTdfH-NlHShUv80R7X3Ssz9G_T38e_yS8eHhD3sz9Gh";

let messaging: any = null;

export const isPushSupported = (): boolean => {
    return (
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
};

try {
    if (isPushSupported()) {
        messaging = getMessaging(app);
    }
} catch (error) {
    console.warn("FCM messaging could not be initialized in this browser context:", error);
}

export interface FCMRegistrationResult {
    success: boolean;
    token?: string;
    error?: string;
    iframeBlocked?: boolean;
}

export const registerFCMToken = async (userId: string, customVapidKey?: string): Promise<FCMRegistrationResult> => {
    if (!isPushSupported()) {
        return {
            success: false,
            error: "Este navegador não suporta notificações de Push ou Service Workers."
        };
    }

    try {
        // First check permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            return {
                success: false,
                error: "Permissão de notificação negada pelo usuário."
            };
        }

        // Check if we are inside a sandboxed iframe that blocks Service Workers
        try {
            // Attempt to register service worker
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                scope: '/'
            });

            // Retrieve token using our VAPID key
            const vapidKey = customVapidKey || localStorage.getItem('fcm_vapid_key') || DEFAULT_VAPID_KEY;
            const token = await getToken(messaging, {
                serviceWorkerRegistration: registration,
                vapidKey: vapidKey
            });

            if (token) {
                // Save locally first
                localStorage.setItem('fcm_token', token);
                if (customVapidKey) {
                    localStorage.setItem('fcm_vapid_key', customVapidKey);
                }

                // Save in user profile in Firestore
                const appId = 'meu-controle-financeiro';
                const profileDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile/userProfile`);
                await setDoc(profileDocRef, { fcmToken: token }, { merge: true });

                return {
                    success: true,
                    token: token
                };
            } else {
                return {
                    success: false,
                    error: "Nenhum token FCM pôde ser gerado. Tente novamente."
                };
            }
        } catch (swError: any) {
            console.error("Erro específico de Service Worker / FCM:", swError);
            
            // Check if failure is due to iframe security constraints
            const isIframe = window.self !== window.top;
            if (isIframe || swError.name === 'SecurityError' || swError.message?.toLowerCase().includes('sandboxed') || swError.message?.toLowerCase().includes('security')) {
                return {
                    success: false,
                    iframeBlocked: true,
                    error: "O navegador bloqueou o registro do Service Worker devido às restrições de sandbox do Redirecionamento de Iframe."
                };
            }
            return {
                success: false,
                error: `Erro ao registrar Service Worker: ${swError.message || swError}`
            };
        }
    } catch (error: any) {
        console.error("Erro geral ao solicitar token FCM:", error);
        return {
            success: false,
            error: error.message || String(error)
        };
    }
};

export const onMessageListener = () =>
    new Promise((resolve, reject) => {
        if (!messaging) {
            reject("FCM messaging não está disponível.");
            return;
        }
        onMessage(messaging, (payload) => {
            console.log("Mensagem recebida em primeiro plano:", payload);
            resolve(payload);
        });
    });
