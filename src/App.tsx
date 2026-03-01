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
                    
                    let isPreApproved = false;
                    try {
                        const whitelistRef = doc(db, `artifacts/${appId}/admin/whitelist`);
                        const whitelistSnap = await getDoc(whitelistRef);
                        if (whitelistSnap.exists()) {
                            const whitelist = whitelistSnap.data().emails || [];
                            isPreApproved = whitelist.includes(user.email?.toLowerCase() || '');
                        }
                    } catch (e) {}

                    const isAdmin = user.email === appConfig.adminEmail;
                    const shouldBeActive = isAdmin || isPreApproved;

                    if (currentProfile) {
                        if (currentProfile.licenseStatus !== 'active' && shouldBeActive) {
                            currentProfile.licenseStatus = 'active';
                            try {
                                await setDoc(profileDocRef, { licenseStatus: 'active' }, { merge: true });
                            } catch (e) {}
                        }
                        setUserProfile(currentProfile);
                    } else {
                        const initialProfile = { 
                            licenseStatus: shouldBeActive ? 'active' : 'pending', 
                            tutorialCompleted: false,
                            email: user.email,
                            uid: user.uid,
                            createdAt: new Date().toISOString()
                        };
                        setUserProfile(initialProfile);
                        try {
                            await setDoc(profileDocRef, initialProfile);
                        } catch (e) {}
                    }

                    try {
                        const registryRef = doc(db, `artifacts/${appId}/users_registry/${user.uid}`);
                        await setDoc(registryRef, {
                            email: user.email,
                            uid: user.uid,
                            licenseStatus: currentProfile?.licenseStatus || (shouldBeActive ? 'active' : 'pending'),
                            lastSeen: new Date().toISOString()
                        }, { merge: true });
                    } catch (e) {}

                    setIsLoading(false);
                },
                (error) => {
                    console.warn("Firestore: Sem permissão para ouvir perfil do usuário.");
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
                <DashboardApp user={user} db={db} onLogout={handleLogout} userProfile={userProfile} onUpdateProfile={handleUpdateProfile} isDemo={isDemo} />
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
