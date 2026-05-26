// Service Worker para Firebase Cloud Messaging (FCM)
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// Inicializa o app com as mesmas credenciais do Firebase do cliente
firebase.initializeApp({
    apiKey: "AIzaSyCv_BOIvgNvF35xGkBl1URnGhzn1LILbFI",
    authDomain: "meu-controle-financeiro-dab61.firebaseapp.com",
    projectId: "meu-controle-financeiro-dab61",
    storageBucket: "meu-controle-financeiro-dab61.appspot.com",
    messagingSenderId: "359873689601",
    appId: "1:359873689601:web:a67817678fdbb18ce76800"
});

const messaging = firebase.messaging();

// Intercepta e gerencia notificações recebidas quando o app está em segundo plano (background)
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Mensagem recebida em segundo plano: ', payload);
    
    const notificationTitle = payload.notification?.title || 'Alerta de Conta - Plano Raiz';
    const notificationOptions = {
        body: payload.notification?.body || 'Você possui contas pendentes de pagamento vencendo em breve.',
        icon: payload.notification?.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'upcoming-bill-notification',
        renotify: true,
        data: payload.data || {}
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Ações ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Tenta encontrar uma aba existente do app ou abre uma nova
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                        break;
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});
