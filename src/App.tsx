import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
    auth, 
    db, 
    onAuthStateChanged, 
    doc, 
    onSnapshot, 
    getDoc, 
    setDoc, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut 
} from './services/firebase';
import { APP_CONFIG } from './constants';
import { LandingPage } from './components/LandingPage';
import { DashboardApp } from './components/DashboardApp';
import { SubscriptionPage } from './components/SubscriptionPage';

export default function App() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isDemo, setIsDemo] = useState(false);
    const [appConfig, setAppConfig] = useState(APP_CONFIG);
    const [sessionTimeout, setSessionTimeout] = useState(() => {
        return localStorage.getItem('session_timeout_pref') || '15';
    });

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
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                setIsDemo(false);
            } else {
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

    useEffect(() => {
        if (user && db && !isDemo) {
            const appId = 'meu-controle-financeiro';
            const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/userProfile`);
            const unsubscribe = onSnapshot(profileDocRef, 
                async (docSnap) => {
                    let currentProfile = docSnap.exists() ? docSnap.data() : null;
                    
                    const isAdmin = user.email === appConfig.adminEmail;

                    if (currentProfile) {
                        setUserProfile(currentProfile);
                    } else {
                        const initialProfile = { 
                            licenseStatus: isAdmin ? 'active' : 'pending', 
                            tutorialCompleted: false,
                            email: user.email,
                            uid: user.uid,
                            createdAt: new Date().toISOString()
                        };
                        setUserProfile(initialProfile);
                        try {
                            await setDoc(profileDocRef, initialProfile);
                        } catch (e) {
                            console.error("Erro ao criar perfil inicial:", e);
                        }
                    }

                    // Tenta atualizar o registro de usuário para o Admin (ignore erros se as regras bloquearem)
                    try {
                        const registryRef = doc(db, `artifacts/${appId}/users_registry/${user.uid}`);
                        await setDoc(registryRef, {
                            email: user.email,
                            uid: user.uid,
                            licenseStatus: currentProfile?.licenseStatus || (isAdmin ? 'active' : 'pending'),
                            lastSeen: new Date().toISOString()
                        }, { merge: true });
                    } catch (e) {}

                    setIsLoading(false);
                },
                (error) => {
                    console.error("Erro ao monitorar perfil do usuário:", error);
                    setIsLoading(false);
                }
            );
            return () => unsubscribe();
        }
    }, [user, db, appConfig.adminEmail, isDemo]);

    const handleLogin = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);

    const handleRegister = async (email: string, password: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const appId = 'meu-controle-financeiro';
        const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/userProfile`);
        
        let isPreApproved = false;
        try {
            const whitelistRef = doc(db, `artifacts/${appId}/admin/whitelist`);
            const whitelistSnap = await getDoc(whitelistRef);
            if (whitelistSnap.exists()) {
                const whitelist = whitelistSnap.data().emails || [];
                isPreApproved = whitelist.includes(email.toLowerCase());
            }
        } catch (e) {}

        const initialProfile = {
            email: user.email,
            uid: user.uid,
            createdAt: new Date().toISOString(),
            licenseStatus: (user.email === appConfig.adminEmail || isPreApproved) ? 'active' : 'pending',
            tutorialCompleted: false
        };

        await setDoc(profileDocRef, initialProfile);
        return userCredential;
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

    const handleSubscribe = async () => {
        if (isDemo) {
            toast.error("Você está no modo demo. Crie uma conta para assinar.");
            return;
        }
        toast.success('Solicitação enviada! Fale com o suporte para ativar.');
    };

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
        return <LandingPage onLogin={handleLogin} onRegister={handleRegister} onDemo={handleDemoMode} config={appConfig} />;
    }

    const isAdmin = user?.email === appConfig.adminEmail;
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
                    sessionTimeout={sessionTimeout}
                    onSessionTimeoutChange={handleSessionTimeoutChange}
                />
                <Toaster position="bottom-right" />
            </>
        );
    }
    
    return (
        <>
            <SubscriptionPage user={user} onSubscribe={handleSubscribe} onLogout={handleLogout} config={appConfig} />
            <Toaster position="bottom-right" />
        </>
    );
}
