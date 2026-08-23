import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAuth, adminDb, APP_ID } from './_lib/firebaseAdmin';
import { findCustomerByExternalReference, createCustomer, createPixCharge } from './_lib/asaas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Método não permitido' });
        return;
    }

    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
        res.status(401).json({ error: 'Token de autenticação ausente.' });
        return;
    }

    let decoded;
    try {
        decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
        res.status(401).json({ error: 'Token inválido ou expirado. Faça login novamente.' });
        return;
    }

    const cpfCnpj = String(req.body?.cpfCnpj || '').replace(/\D/g, '');
    if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
        res.status(400).json({ error: 'Informe um CPF ou CNPJ válido.' });
        return;
    }

    try {
        const configSnap = await adminDb.doc(`artifacts/${APP_ID}/admin/config`).get();
        const price = configSnap.exists ? (configSnap.data()?.defaultPrice ?? 9.99) : 9.99;

        let customer = await findCustomerByExternalReference(decoded.uid);
        if (!customer) {
            customer = await createCustomer({
                name: decoded.name || decoded.email || 'Cliente Plano Raiz',
                email: decoded.email as string,
                cpfCnpj,
                uid: decoded.uid,
            });
        }

        const { payment, qrCode } = await createPixCharge({
            customerId: customer.id,
            uid: decoded.uid,
            value: price,
            description: 'Licença vitalícia - Plano Raiz',
        });

        await adminDb.doc(`artifacts/${APP_ID}/users/${decoded.uid}/profile/userProfile`).set(
            {
                asaasCustomerId: customer.id,
                lastPaymentId: payment.id,
                lastPaymentStatus: payment.status,
            },
            { merge: true }
        );

        res.status(200).json({
            paymentId: payment.id,
            copyPaste: qrCode.payload,
            qrCodeImage: qrCode.encodedImage,
            expirationDate: qrCode.expirationDate,
            value: price,
        });
    } catch (err) {
        console.error('Erro ao gerar cobrança Pix:', err);
        res.status(500).json({ error: 'Não foi possível gerar a cobrança agora. Tente novamente em instantes.' });
    }
}
