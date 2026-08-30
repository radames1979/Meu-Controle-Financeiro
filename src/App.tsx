import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    auth,
    db,
    googleProvider,
    onAuthStateChanged,
    doc,
    onSnapshot,
    getDoc,
    setDoc,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult
} from './services/firebase';
import { APP_CONFIG } from './constants';
import { LandingPage } from './components/LandingPage';
import { DashboardApp } from './components/DashboardApp';
import { SubscriptionPage } from './components/SubscriptionPage';
import { LegalPage } from './components/LegalPage';

const LEGAL_ROUTES: Record<string, 'terms' | 'privacy'> = {
    '/termos': 'terms',
    '/privacidade': 'privacy',
};

export default function App() {
    const [legalPage, setLegalPage] = useState<'terms' | 'privacy' | null>(() => LEGAL_ROUTES[window.location.pathname] || null);
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isDemo, setIsDemo] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [appConfig, setAppConfig] = useState(APP_CONFIG);
    const [sessionTimeout, setSessionTimeout] = useState(() => {
        return localStorage.getItem('session_timeout_pref') || '15';
    });
    const [notificationAdvance, setNotificationAdvance] = useState(() => {
        return localStorage.getItem('notification_advance_pref') || '3';
    });

    useEffect(() => {
        const onPopState = () => setLegalPage(LEGAL_ROUTES[window.location.pathname] || null);
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    useEffect(() => {
        const fetchConfig = async () => {
            if (!db) return;
            try {
                const appId = 'meu-controle-financeiro';
                const configRef = doc(db, `artifacts/${appId}/admin/config`);
                const docSnap = await getDoc(configRef);
                if (docSnap.exists()) {
                    setAppConfig(prev => ({ ...prev, ...docSnap.data() }));
                }
            } catch (e) {
                console.warn("Aviso: Usando configurações padrão (verifique as regras do Firestore).");
            }
        };
        fetchConfig();
        
        if (db) {
            const appId = 'meu-controle-financeiro';
            const configRef = doc(db, `artifacts/${appId}/admin/config`);
            const unsubscribe = onSnapshot(configRef, 
                (snap) => {
                    if (snap.exists()) {
                        setAppConfig(prev => ({ ...prev, ...snap.data() }));
                    }
                },
                (error) => {
                    console.warn("Firestore: Sem permissão para ouvir atualizações de config em tempo real.");
                }
            );
            return () => unsubscribe();
        }
    }, [db]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                let adminClaim = false;
                try {
                    // Força a renovação do token para pegar uma claim de admin recém-concedida.
                    const tokenResult = await firebaseUser.getIdTokenResult(true);
                    adminClaim = tokenResult.claims?.admin === true;
                } catch (e) {
                    console.error("Erro ao verificar permissões de administrador:", e);
                }
                setIsAdmin(adminClaim);
                setUser(firebaseUser);
                setIsDemo(false);
            } else {
                setIsAdmin(false);
                setUser((prev: any) => {
                    if (prev?.uid === 'demo-user') return prev;
                    return null;
                });
                setUserProfile((prev: any) => {
                    if (prev?.isDemo) return prev;
                    return null;
                });
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Completa o login por redirecionamento (fallback quando o popup do Google é bloqueado).
    useEffect(() => {
        getRedirectResult(auth).catch((err: any) => {
            if (err.code === 'auth/account-exists-with-different-credential') {
                toast.error('Esse e-mail já tem uma conta criada com senha. Faça login com e-mail e senha.');
            } else if (err.code) {
                toast.error('Não foi possível concluir o login com Google. Tente novamente.');
            }
        });
    }, []);

    useEffect(() => {
        if (user && db && !isDemo) {
            const appId = 'meu-controle-financeiro';
            const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/userProfile`);
            const unsubscribe = onSnapshot(profileDocRef, 
                async (docSnap) => {
                    let currentProfile = docSnap.exists() ? docSnap.data() : null;

                    if (currentProfile) {
                        setUserProfile(currentProfile);

                        // Sincroniza o "visto por último" (única alteração que as regras do
                        // Firestore permitem o próprio cliente fazer no perfil/registro).
                        try {
                            const registryRef = doc(db, `artifacts/${appId}/users_registry/${user.uid}`);
                            await setDoc(registryRef, {
                                email: user.email,
                                uid: user.uid,
                                licenseStatus: currentProfile.licenseStatus,
                                lastSeen: new Date().toISOString()
                            }, { merge: true });
                        } catch (e) {}

                        setIsLoading(false);
                    } else {
                        // Perfil ainda não existe: criado no servidor (via Admin SDK), nunca
                        // pelo próprio cliente -- assim ninguém consegue forjar a própria
                        // criação de perfil com licenseStatus "active" sem pagar. O onSnapshot
                        // acima dispara de novo assim que o documento é criado no servidor.
                        try {
                            const idToken = await user.getIdToken();
                            const res = await fetch('/api/create-profile', {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${idToken}` },
                            });
                            if (!res.ok) throw new Error('Falha ao criar perfil');
                        } catch (e) {
                            console.error("Erro ao criar perfil inicial:", e);
                            toast.error('Não foi possível preparar sua conta. Tente novamente em instantes.');
                            setIsLoading(false);
                        }
                    }
                },
                (error) => {
                    console.error("Erro ao monitorar perfil do usuário:", error);
                    setIsLoading(false);
                }
            );
            return () => unsubscribe();
        }
    }, [user, db, isAdmin, isDemo]);

    const handleLogin = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);

    const handleForgotPassword = (email: string) => sendPasswordResetEmail(auth, email);

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err: any) {
            if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
                return;
            }
            if (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment') {
                await signInWithRedirect(auth, googleProvider);
                return;
            }
            if (err.code === 'auth/account-exists-with-different-credential') {
                toast.error('Esse e-mail já tem uma conta criada com senha. Faça login com e-mail e senha.');
                return;
            }
            toast.error('Não foi possível entrar com Google. Tente novamente.');
        }
    };

    const handleRegister = async (email: string, password: string) => {
        // O perfil inicial (com a checagem de pré-aprovação por whitelist) é criado
        // no servidor pelo efeito que observa o perfil, assim que a conta loga pela
        // primeira vez -- ver /api/create-profile.
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const handleLogout = () => {
        if (isDemo) {
            setIsDemo(false);
            setUserProfile(null);
            setUser(null);
            return;
        }
        signOut(auth).then(() => {
            setUserProfile(null);
            toast.success('Você saiu com sucesso!');
        });
    };

    const handleDemoMode = () => {
        setIsDemo(true);
        setIsAdmin(false);
        setUser({ email: 'visitante@demo.com', uid: 'demo-user' });
        setUserProfile({ licenseStatus: 'active', tutorialCompleted: true, isDemo: true });
        setIsLoading(false);
        toast.success('Entrando no Modo Demo...');
    };

    // Load initial sessionTimeout setting from user profile
    useEffect(() => {
        if (userProfile?.uiSettings?.sessionTimeout) {
            setSessionTimeout(userProfile.uiSettings.sessionTimeout);
            localStorage.setItem('session_timeout_pref', userProfile.uiSettings.sessionTimeout);
        }
        if (userProfile?.uiSettings?.notificationAdvance) {
            setNotificationAdvance(userProfile.uiSettings.notificationAdvance);
            localStorage.setItem('notification_advance_pref', userProfile.uiSettings.notificationAdvance);
        }
    }, [userProfile]);

    // Handle updating of sessionTimeout preference
    const handleSessionTimeoutChange = (newTimeout: string) => {
        setSessionTimeout(newTimeout);
        localStorage.setItem('session_timeout_pref', newTimeout);
        
        if (user && !isDemo && db) {
            handleUpdateProfile({
                uiSettings: {
                    ...userProfile?.uiSettings,
                    sessionTimeout: newTimeout
                }
            });
        }
    };

    // Handle updating of notificationAdvance preference
    const handleNotificationAdvanceChange = (newAdvance: string) => {
        setNotificationAdvance(newAdvance);
        localStorage.setItem('notification_advance_pref', newAdvance);
        
        if (user && !isDemo && db) {
            handleUpdateProfile({
                uiSettings: {
                    ...userProfile?.uiSettings,
                    notificationAdvance: newAdvance
                }
            });
        }
    };

    // Activity tracking for automatic session timeout
    useEffect(() => {
        if (!user) return;
        if (sessionTimeout === 'off') return;

        const timeoutMs = parseInt(sessionTimeout, 10) * 60 * 1000;
        if (isNaN(timeoutMs) || timeoutMs <= 0) return;

        // Set initial activity time
        const now = Date.now();
        localStorage.setItem('last_activity_time', String(now));

        const updateActivity = () => {
            localStorage.setItem('last_activity_time', String(Date.now()));
        };

        // Listen for user interaction
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            window.addEventListener(event, updateActivity, { passive: true });
        });

        const checkInactivity = setInterval(() => {
            const lastActivity = parseInt(localStorage.getItem('last_activity_time') || '0', 10);
            if (Date.now() - lastActivity >= timeoutMs) {
                toast.error('Sessão encerrada por inatividade. Faça login novamente.', {
                    duration: 5000,
                    id: 'session-timeout-toast'
                });
                handleLogout();
            }
        }, 10000); // Check every 10 seconds

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, updateActivity);
            });
            clearInterval(checkInactivity);
        };
    }, [user, sessionTimeout]);

    const handleUpdateProfile = async (dataToUpdate: any) => {
        if (isDemo) return;
        if (user && db) {
            const appId = 'meu-controle-financeiro';
            const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/userProfile`);
            try {
                await setDoc(profileDocRef, dataToUpdate, { merge: true });
            } catch (error) {
                console.error("Erro ao atualizar perfil:", error);
                toast.error("Não foi possível salvar a preferência.");
            }
        }
    };

    const navigateToLegal = (type: 'terms' | 'privacy') => {
        const path = type === 'terms' ? '/termos' : '/privacidade';
        window.history.pushState({}, '', path);
        setLegalPage(type);
    };

    const navigateHome = () => {
        window.history.pushState({}, '', '/');
        setLegalPage(null);
    };

    if (legalPage) {
        return <LegalPage type={legalPage} onBack={navigateHome} />;
    }

    if (isLoading || (user && !userProfile)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <div className="text-center">
                    <p className="text-lg text-slate-600">A carregar...</p>
                </div>
            </div>
        );
    }

    if (!user && !isDemo) {
        return <LandingPage onLogin={handleLogin} onRegister={handleRegister} onDemo={handleDemoMode} onForgotPassword={handleForgotPassword} onGoogleLogin={handleGoogleLogin} onNavigateToLegal={navigateToLegal} config={appConfig} />;
    }

    const isApproved = userProfile?.licenseStatus === 'active' || isAdmin;

    if (isApproved) {
        return (
            <>
                <DashboardApp
                    user={user}
                    db={db}
                    onLogout={handleLogout}
                    userProfile={userProfile}
                    onUpdateProfile={handleUpdateProfile}
                    isDemo={isDemo}
                    isAdmin={isAdmin}
                    sessionTimeout={sessionTimeout}
                    onSessionTimeoutChange={handleSessionTimeoutChange}
                    notificationAdvance={notificationAdvance}
                    onNotificationAdvanceChange={handleNotificationAdvanceChange}
                />
                <Toaster position="bottom-right" />
            </>
        );
    }
    
    return (
        <>
            <SubscriptionPage user={user} onLogout={handleLogout} config={appConfig} />
            <Toaster position="bottom-right" />
        </>
    );
}
