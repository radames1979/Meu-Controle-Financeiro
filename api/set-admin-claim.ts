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

    let caller;
    try {
        caller = await adminAuth.verifyIdToken(idToken);
    } catch {
        res.status(401).json({ error: 'Token inválido ou expirado. Faça login novamente.' });
        return;
    }

    if (caller.admin !== true) {
        res.status(403).json({ error: 'Apenas administradores podem gerenciar outros administradores.' });
        return;
    }

    const targetEmail = String(req.body?.targetEmail || '').trim().toLowerCase();
    const makeAdmin = Boolean(req.body?.makeAdmin);
    if (!targetEmail) {
        res.status(400).json({ error: 'Informe o e-mail do usuário.' });
        return;
    }

    try {
        const targetUser = await adminAuth.getUserByEmail(targetEmail);

        if (!makeAdmin && targetUser.uid === caller.uid) {
            res.status(400).json({ error: 'Você não pode remover seu próprio acesso de administrador.' });
            return;
        }

        await adminAuth.setCustomUserClaims(targetUser.uid, { admin: makeAdmin });

        await adminDb.doc(`artifacts/${APP_ID}/users_registry/${targetUser.uid}`).set(
            { isAdmin: makeAdmin, email: targetUser.email },
            { merge: true }
        );

        res.status(200).json({ uid: targetUser.uid, email: targetUser.email, isAdmin: makeAdmin });
    } catch (err: any) {
        console.error('Erro ao alterar claim de admin:', err);
        if (err?.code === 'auth/user-not-found') {
            res.status(404).json({ error: 'Usuário não encontrado com esse e-mail.' });
            return;
        }
        res.status(500).json({ error: 'Não foi possível atualizar o administrador.' });
    }
}
