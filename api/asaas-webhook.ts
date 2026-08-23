import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminDb, APP_ID } from './_lib/firebaseAdmin';

// Eventos do Asaas que confirmam o recebimento do Pix.
// Ver: https://docs.asaas.com/docs/webhook-events
const CONFIRMED_EVENTS = new Set(['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.status(405).end();
        return;
    }

    // O Asaas reenvia, em todo webhook, o "Token de acesso" configurado no painel
    // como o cabeçalho abaixo. Isso garante que só o Asaas consegue ativar licenças.
    const receivedToken = req.headers['asaas-access-token'];
    if (!process.env.ASAAS_WEBHOOK_TOKEN || receivedToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
        res.status(401).json({ error: 'Token de webhook inválido.' });
        return;
    }

    const { event, payment } = req.body || {};
    const uid = payment?.externalReference;

    if (!uid) {
        // Evento sem referência ao usuário (ex.: cobrança criada fora deste fluxo). Ignora sem erro.
        res.status(200).json({ ignored: true });
        return;
    }

    if (CONFIRMED_EVENTS.has(event)) {
        const now = new Date().toISOString();
        try {
            await adminDb.doc(`artifacts/${APP_ID}/users/${uid}/profile/userProfile`).set(
                {
                    licenseStatus: 'active',
                    lastPaymentId: payment.id,
                    lastPaymentStatus: payment.status,
                    licenseActivatedAt: now,
                },
                { merge: true }
            );
            await adminDb.doc(`artifacts/${APP_ID}/users_registry/${uid}`).set(
                {
                    licenseStatus: 'active',
                    licenseActivatedAt: now,
                },
                { merge: true }
            );
        } catch (err) {
            console.error('Erro ao ativar licença via webhook Asaas:', err);
            res.status(500).json({ error: 'Falha ao processar webhook.' });
            return;
        }
    }

    res.status(200).json({ received: true });
}
