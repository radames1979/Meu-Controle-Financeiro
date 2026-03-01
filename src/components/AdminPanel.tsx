import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Trash2, Plus, Tags } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from '../services/firebase';
import { APP_CONFIG } from '../constants';

export const AdminPanel = ({ onClose }: { onClose: () => void }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [whitelist, setWhitelist] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [appStats, setAppStats] = useState({ totalUsers: 0, activeLicenses: 0 });
    const [config, setConfig] = useState(APP_CONFIG);
    const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'whitelist'>('users');
    const [newWhitelistEmail, setNewWhitelistEmail] = useState('');
    const appId = 'meu-controle-financeiro';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersCol = collection(db, `artifacts/${appId}/users_registry`);
                const snapshot = await getDocs(usersCol);
                
                const usersList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setUsers(usersList);
                setAppStats({
                    totalUsers: usersList.length,
                    activeLicenses: usersList.filter((u: any) => u.licenseStatus === 'active').length
                });

                const configRef = doc(db, `artifacts/${appId}/admin/config`);
                const configSnap = await getDoc(configRef);
                if (configSnap.exists()) {
                    setConfig(prev => ({ ...prev, ...configSnap.data() }));
                }

                const whitelistRef = doc(db, `artifacts/${appId}/admin/whitelist`);
                const whitelistSnap = await getDoc(whitelistRef);
                if (whitelistSnap.exists()) {
                    setWhitelist(whitelistSnap.data().emails || []);
                }
            } catch (err) {
                console.error("Erro ao buscar dados do admin no Firestore:", err);
                toast.error("Erro ao carregar usuários. Verifique as regras de segurança do Firebase.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleToggleLicense = async (user: any) => {
        const newStatus = user.licenseStatus === 'active' ? 'pending' : 'active';
        try {
            const userId = user.uid || user.id;
            const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/userProfile`);
            await updateDoc(userProfileRef, { licenseStatus: newStatus });
            
            const registryRef = doc(db, `artifacts/${appId}/users_registry/${userId}`);
            await updateDoc(registryRef, { licenseStatus: newStatus });
            
            setUsers(users.map(u => (u.uid === userId || u.id === userId) ? { ...u, licenseStatus: newStatus } : u));
            toast.success(`Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'}`);
        } catch (err) {
            console.error("Erro ao atualizar licença:", err);
            toast.error("Erro ao atualizar licença no Firebase");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Tem certeza que deseja excluir este usuário da lista de administração?")) return;
        try {
            const registryRef = doc(db, `artifacts/${appId}/users_registry/${userId}`);
            await deleteDoc(registryRef);
            
            const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/userProfile`);
            await updateDoc(profileRef, { licenseStatus: 'revoked' }).catch(() => {});
            
            setUsers(users.filter(u => (u.uid || u.id) !== userId));
            toast.success("Usuário removido da gestão");
        } catch (err) {
            console.error("Erro ao excluir usuário:", err);
            toast.error("Erro ao excluir usuário");
        }
    };

    const handleUpdateConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const configRef = doc(db, `artifacts/${appId}/admin/config`);
            await setDoc(configRef, config, { merge: true });
            toast.success("Configurações salvas no Firebase!");
        } catch (err) {
            console.error("Erro ao salvar config:", err);
            toast.error("Erro de permissão ao salvar no Firebase.");
        }
    };

    const handleAddToWhitelist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWhitelistEmail) return;
        const emailLower = newWhitelistEmail.toLowerCase();
        if (whitelist.includes(emailLower)) {
            toast.error("Este e-mail já está na lista branca.");
            return;
        }
        const updatedWhitelist = [...whitelist, emailLower];
        try {
            const whitelistRef = doc(db, `artifacts/${appId}/admin/whitelist`);
            await setDoc(whitelistRef, { emails: updatedWhitelist });
            
            setWhitelist(updatedWhitelist);
            setNewWhitelistEmail('');
            
            const existingUser = users.find(u => u.email?.toLowerCase() === emailLower);
            if (existingUser && existingUser.licenseStatus !== 'active') {
                const userProfileRef = doc(db, `artifacts/${appId}/users/${existingUser.uid || existingUser.id}/profile/userProfile`);
                await updateDoc(userProfileRef, { licenseStatus: 'active' });
                setUsers(users.map(u => u.email?.toLowerCase() === emailLower ? { ...u, licenseStatus: 'active' } : u));
            }
            
            toast.success("E-mail aprovado e liberado!");
        } catch (err) {
            console.error("Erro ao salvar whitelist:", err);
            toast.error("Erro de permissão ao salvar lista branca.");
        }
    };

    const handleRemoveFromWhitelist = async (email: string) => {
        const updatedWhitelist = whitelist.filter(e => e !== email);
        try {
            const whitelistRef = doc(db, `artifacts/${appId}/admin/whitelist`);
            await setDoc(whitelistRef, { emails: updatedWhitelist });
            setWhitelist(updatedWhitelist);
            toast.success("E-mail removido da lista");
        } catch (err) {
            console.error("Erro ao remover da whitelist:", err);
            toast.error("Erro ao atualizar lista branca.");
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-800 dark:bg-slate-900 text-white">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold flex items-center gap-2"><ShieldCheck /> Admin</h2>
                        <div className="flex bg-slate-700 dark:bg-slate-800 p-1 rounded-lg">
                            <button onClick={() => setActiveTab('users')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${activeTab === 'users' ? 'bg-white text-slate-800' : 'text-slate-300 hover:text-white'}`}>Usuários</button>
                            <button onClick={() => setActiveTab('whitelist')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${activeTab === 'whitelist' ? 'bg-white text-slate-800' : 'text-slate-300 hover:text-white'}`}>Pré-Aprovar</button>
                            <button onClick={() => setActiveTab('settings')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${activeTab === 'settings' ? 'bg-white text-slate-800' : 'text-slate-300 hover:text-white'}`}>Configurações</button>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition"><X /></button>
                </div>
                
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {activeTab === 'users' ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold mb-1">Total de Usuários</p>
                                    <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{appStats.totalUsers}</p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                                    <p className="text-emerald-600 dark:text-emerald-400 text-xs uppercase font-bold mb-1">Licenças Ativas</p>
                                    <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{appStats.activeLicenses}</p>
                                </div>
                                <div className="bg-cyan-50 dark:bg-cyan-500/10 p-6 rounded-2xl border border-cyan-100 dark:border-cyan-500/20">
                                    <p className="text-cyan-600 dark:text-cyan-400 text-xs uppercase font-bold mb-1">Receita Potencial</p>
                                    <p className="text-3xl font-black text-cyan-700 dark:text-cyan-300">R$ {(appStats.activeLicenses * config.defaultPrice).toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Usuário</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {loading ? (
                                            <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">Carregando...</td></tr>
                                        ) : users.map((user, idx) => (
                                            <tr key={user.uid || user.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700 dark:text-slate-200">{user.email}</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[9px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase font-mono">ID: {(user.uid || user.id || '').substring(0, 8)}...</span>
                                                            {user.lastSeen && <span className="text-[9px] text-slate-400 dark:text-slate-500">Visto em: {new Date(user.lastSeen).toLocaleDateString()}</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.licenseStatus === 'active' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                                        {user.licenseStatus === 'active' ? 'Ativo' : 'Pendente'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button onClick={() => handleToggleLicense(user)} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${user.licenseStatus === 'active' ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}>
                                                        {user.licenseStatus === 'active' ? 'Desativar' : 'Ativar'}
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(user.uid || user.id)} className="text-slate-400 dark:text-slate-500 hover:text-rose-500 p-1.5 transition"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : activeTab === 'whitelist' ? (
                        <div className="max-w-2xl space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Pré-Aprovar E-mails</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">E-mails cadastrados aqui terão acesso liberado automaticamente assim que criarem a conta.</p>
                                <form onSubmit={handleAddToWhitelist} className="flex gap-2">
                                    <input 
                                        type="email" 
                                        required
                                        value={newWhitelistEmail}
                                        onChange={e => setNewWhitelistEmail(e.target.value)}
                                        placeholder="email@cliente.com"
                                        className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200"
                                    />
                                    <button type="submit" className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-600 transition flex items-center gap-2">
                                        <Plus size={20} /> Aprovar
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">E-mail Pré-Aprovado</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {whitelist.length === 0 ? (
                                            <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">Nenhum e-mail na lista branca.</td></tr>
                                        ) : whitelist.map((email, idx) => (
                                            <tr key={`${email}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">{email}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleRemoveFromWhitelist(email)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-2 rounded-lg transition">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateConfig} className="max-w-2xl space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Preço da Licença (R$)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={config.defaultPrice} 
                                        onChange={e => setConfig({ ...config, defaultPrice: parseFloat(e.target.value) })}
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Chave PIX</label>
                                    <input 
                                        type="text" 
                                        value={config.pixKey} 
                                        onChange={e => setConfig({ ...config, pixKey: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">E-mail de Suporte</label>
                                    <input 
                                        type="email" 
                                        value={config.supportEmail} 
                                        onChange={e => setConfig({ ...config, supportEmail: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">WhatsApp de Suporte</label>
                                    <input 
                                        type="text" 
                                        value={config.supportWhatsapp} 
                                        onChange={e => setConfig({ ...config, supportWhatsapp: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 dark:border-slate-700">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase mb-4 flex items-center gap-2">
                                    <Tags size={18} className="text-cyan-500" /> Gerenciar Patrocinadores
                                </h3>
                                <div className="space-y-4">
                                    {config.sponsors && config.sponsors.map((sponsor: any, idx: number) => (
                                        <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Nome do Patrocinador</label>
                                                <input 
                                                    type="text" 
                                                    value={sponsor.name} 
                                                    onChange={e => {
                                                        const newSponsors = [...config.sponsors];
                                                        newSponsors[idx].name = e.target.value;
                                                        setConfig({ ...config, sponsors: newSponsors });
                                                    }}
                                                    className="w-full text-sm rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200"
                                                />
                                            </div>
                                            <div className="flex-[2]">
                                                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">URL da Logo (PNG/SVG)</label>
                                                <input 
                                                    type="text" 
                                                    value={sponsor.logo} 
                                                    onChange={e => {
                                                        const newSponsors = [...config.sponsors];
                                                        newSponsors[idx].logo = e.target.value;
                                                        setConfig({ ...config, sponsors: newSponsors });
                                                    }}
                                                    className="w-full text-sm rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-cyan-500 focus:border-cyan-500 dark:text-slate-200"
                                                />
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const newSponsors = config.sponsors.filter((_: any, i: number) => i !== idx);
                                                    setConfig({ ...config, sponsors: newSponsors });
                                                }}
                                                className="self-end p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const newSponsors = [...(config.sponsors || []), { name: '', logo: '' }];
                                            setConfig({ ...config, sponsors: newSponsors });
                                        }}
                                        className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-cyan-500 hover:text-cyan-500 transition-all font-medium text-sm flex items-center justify-center gap-2"
                                    >
                                        <Plus size={18} /> Adicionar Patrocinador
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                <button type="submit" className="bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-cyan-600 transition shadow-lg shadow-cyan-500/30">Salvar Alterações</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
