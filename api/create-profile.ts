import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAuth, adminDb, APP_ID } from './_lib/firebaseAdmin.js';

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

    const profileRef = adminDb.doc(`artifacts/${APP_ID}/users/${decoded.uid}/profile/userProfile`);

    try {
        const existing = await profileRef.get();
        if (existing.exists) {
            res.status(200).json({ created: false, profile: existing.data() });
            return;
        }

        // Ativação automática só acontece aqui, no servidor: nem o cadastro por
        // e-mail/senha nem o primeiro login via Google decidem sozinhos se a
        // licença nasce ativa. Isso impede alguém de forjar o próprio perfil com
        // licenseStatus "active" direto no Firestore, sem pagar nada.
        let isPreApproved = false;
        try {
            const whitelistSnap = await adminDb.doc(`artifacts/${APP_ID}/admin/whitelist`).get();
            const emails: string[] = whitelistSnap.exists ? (whitelistSnap.data()?.emails || []) : [];
            isPreApproved = !!decoded.email && emails.includes(decoded.email.toLowerCase());
        } catch {}

        const now = new Date().toISOString();
        const profile = {
            email: decoded.email || null,
            uid: decoded.uid,
            createdAt: now,
            licenseStatus: (decoded.admin === true || isPreApproved) ? 'active' : 'pending',
            tutorialCompleted: false,
            termsAcceptedAt: now,
        };

        await profileRef.set(profile);
        await adminDb.doc(`artifacts/${APP_ID}/users_registry/${decoded.uid}`).set(
            {
                email: decoded.email || null,
                uid: decoded.uid,
                licenseStatus: profile.licenseStatus,
                lastSeen: now,
            },
            { merge: true }
        );

        res.status(200).json({ created: true, profile });
    } catch (err) {
        console.error('Erro ao criar perfil inicial:', err);
        res.status(500).json({ error: 'Não foi possível criar seu perfil agora. Tente novamente.' });
    }
}
