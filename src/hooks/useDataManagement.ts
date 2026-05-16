import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, collection, handleFirestoreError, OperationType } from '../services/firebase';
import { INITIAL_CATEGORIES, MOCK_TRANSACTIONS } from '../constants';

export const useDataManagement = (db: any, userId: string, isDemo: boolean = false) => {
    const [transactions, setTransactions] = useState<any[]>(isDemo ? MOCK_TRANSACTIONS : []);
    const [budgets, setBudgets] = useState<any>(isDemo ? { 'Alimentação': 1000, 'Moradia': 1500, 'Transporte': 300, 'Lazer': 500 } : {});
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);

    useEffect(() => {
        if (isDemo) return;
        if (!db || !userId) return;
        const appId = 'meu-controle-financeiro';
        const settingsPath = `artifacts/${appId}/users/${userId}/settings/userSettings`;
        const settingsDocRef = doc(db, settingsPath);
        
        const unsubscribeSettings = onSnapshot(settingsDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBudgets(data.budgets || {});
                setCategories(data.categories || INITIAL_CATEGORIES);
            } else {
                setDoc(settingsDocRef, { budgets: {}, categories: INITIAL_CATEGORIES }).catch(error => {
                    handleFirestoreError(error, OperationType.WRITE, settingsPath);
                });
            }
        }, (error) => {
            handleFirestoreError(error, OperationType.GET, settingsPath);
        });

        const transactionsPath = `artifacts/${appId}/users/${userId}/transactions`;
        const transactionsColRef = collection(db, transactionsPath);
        const unsubscribeTransactions = onSnapshot(transactionsColRef, (querySnapshot) => {
            const transactionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(transactionsData);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, transactionsPath);
        });

        return () => {
            unsubscribeSettings();
            unsubscribeTransactions();
        };
    }, [db, userId, isDemo]);

    return { transactions, setTransactions, budgets, setBudgets, categories, setCategories };
};
