import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    Plus, 
    UserPlus,
    Search, 
    Shield, 
    User as UserIcon, 
    Mail, 
    Phone, 
    MoreVertical,
    Loader2,
    X,
    Zap,
    Edit2,
    Trash2,
    Layers
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Member search/filter
    const [memberSearchTerm, setMemberSearchTerm] = useState('');
    
    // Member Modals
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [submittingMember, setSubmittingMember] = useState(false);
    const [memberFormData, setMemberFormData] = useState({
        id: '', // For editing
        name: '',
        email: '',
        phone: '',
        role: 'admin',
        is_superadmin: false,
        password: '',
        assigned_category_id: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, catsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/categories')
            ]);
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
        } catch (error) {
            console.error('Error fetching management data:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingMember(true);
        try {
            if (memberFormData.id) {
                await api.put(`/admin/users/${memberFormData.id}`, memberFormData);
                toast.success('Funcionário atualizado com sucesso!');
            } else {
                await api.post('/admin/users', memberFormData);
                toast.success('Funcionário criado com sucesso!');
            }
            setIsMemberModalOpen(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao guardar membro');
        } finally {
            setSubmittingMember(false);
        }
    };

    const handleDeleteMember = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja remover este membro da equipa?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success('Membro removido com sucesso');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao remover membro');
        }
    };

    const resetForm = () => {
        setMemberFormData({ 
            id: '', 
            name: '', 
            email: '', 
            phone: '', 
            role: 'admin', 
            is_superadmin: false, 
            password: '', 
            assigned_category_id: '' 
        });
    };

    const openEditModal = (user: any) => {
        setMemberFormData({
            id: user.id,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'admin',
            is_superadmin: !!user.is_superadmin,
            password: '',
            assigned_category_id: user.assigned_category_id || ''
        });
        setIsMemberModalOpen(true);
    };

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(memberSearchTerm.toLowerCase()) || 
        user.email?.toLowerCase().includes(memberSearchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Minha Equipa</h2>
                    <p className="text-muted-foreground">O Admin pode criar e gerir funcionários (operadores).</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Procurar funcionário..." 
                        className="pl-9 bg-card border-border/50 h-10 rounded-xl"
                        value={memberSearchTerm}
                        onChange={(e) => setMemberSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => { resetForm(); setIsMemberModalOpen(true); }} className="gap-2 bg-primary hover:bg-navy-dark rounded-xl h-11 px-6 shadow-lg shadow-primary/20 w-full sm:w-auto text-sm font-bold uppercase tracking-wider">
                    <Plus className="w-5 h-5" />
                    Novo Funcionário
                </Button>
            </div>

            <Card className="glass-card border-border/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border/10">
                            <tr>
                                <th className="px-6 py-4 font-bold">Membro</th>
                                <th className="px-6 py-4 font-bold text-center">Acesso</th>
                                <th className="px-6 py-4 font-bold">Categoria Resp.</th>
                                <th className="px-6 py-4 font-bold">Estado</th>
                                <th className="px-6 py-4 font-bold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                            <p className="text-muted-foreground">A carregar...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        Nenhum funcionário encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">{user.name}</p>
                                                    <p className="text-[11px] text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Badge 
                                                variant="outline" 
                                                className={cn(
                                                    "font-bold text-[10px] uppercase px-2 py-0.5",
                                                    user.is_superadmin 
                                                        ? "bg-navy-dark text-white border-none" 
                                                        : "bg-primary/5 text-primary border-primary/20"
                                                )}
                                            >
                                                {user.is_superadmin ? 'Admin' : 'Operador'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.assigned_category ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                                                        <Layers className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-xs font-semibold text-foreground">
                                                        {user.assigned_category.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest bg-muted px-2 py-0.5 rounded">
                                                    Geral / Todos
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-whatsapp text-[11px] font-bold">
                                                <div className="w-1.5 h-1.5 rounded-full bg-whatsapp animate-pulse" />
                                                Ativo
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button 
                                                    onClick={() => openEditModal(user)}
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-muted-foreground rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                {currentUser?.id !== user.id && (
                                                    <Button 
                                                        onClick={() => handleDeleteMember(user.id)}
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-muted-foreground rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal para Adicionar Membro */}
            <AnimatePresence>
                {isMemberModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl border border-border w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-8 border-b border-border bg-gradient-to-br from-navy-dark to-navy text-white relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Shield className="w-32 h-32" />
                                </div>
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                            <UserPlus className="w-6 h-6 text-gold" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-2xl">{memberFormData.id ? 'Editar Funcionário' : 'Novo Funcionário'}</h3>
                                            <p className="text-xs text-white/60 font-medium">Configure os dados de acesso administrativo.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsMemberModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                        <X className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleCreateOrUpdateMember} className="p-8 space-y-6 h-auto max-h-[75vh] overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Nome Completo</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                            <Input 
                                                required
                                                placeholder="Nome do trabalhador" 
                                                className="pl-9 h-12 bg-muted/20 border-border/30 rounded-2xl focus:ring-primary/20 text-sm"
                                                value={memberFormData.name}
                                                onChange={(e) => setMemberFormData({...memberFormData, name: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Telemóvel</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                            <Input 
                                                placeholder="+258..." 
                                                className="pl-9 h-12 bg-muted/20 border-border/30 rounded-2xl focus:ring-primary/20 text-sm"
                                                value={memberFormData.phone}
                                                onChange={(e) => setMemberFormData({...memberFormData, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Email Corporativo</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                        <Input 
                                            required
                                            type="email"
                                            placeholder="email@ne-equipment.com" 
                                            className="pl-9 h-12 bg-muted/20 border-border/30 rounded-2xl focus:ring-primary/20 text-sm"
                                            value={memberFormData.email}
                                            onChange={(e) => setMemberFormData({...memberFormData, email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Papel</label>
                                        <select 
                                            value={memberFormData.role}
                                            onChange={(e) => setMemberFormData({...memberFormData, role: e.target.value})}
                                            className="w-full h-12 bg-muted/20 border border-border/30 rounded-2xl px-4 text-sm focus:ring-primary/20 outline-none"
                                        >
                                            <option value="admin">Administrador (Gestão)</option>
                                            <option value="customer">Cliente (B2B)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">
                                            {memberFormData.id ? 'Nova Senha (opcional)' : 'Senha de Acesso'}
                                        </label>
                                        <Input 
                                            required={!memberFormData.id}
                                            type="password"
                                            placeholder={memberFormData.id ? "Manter atual" : "Min: 6 chars"} 
                                            className="h-12 bg-muted/20 border-border/30 rounded-2xl focus:ring-primary/20 text-sm"
                                            value={memberFormData.password}
                                            onChange={(e) => setMemberFormData({...memberFormData, password: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Categoria de Responsabilidade</label>
                                    <div className="relative">
                                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                        <select 
                                            value={memberFormData.assigned_category_id}
                                            onChange={(e) => setMemberFormData({...memberFormData, assigned_category_id: e.target.value})}
                                            className="w-full h-12 pl-9 bg-muted/20 border border-border/30 rounded-2xl px-4 text-sm focus:ring-primary/20 outline-none appearance-none"
                                        >
                                            <option value="">Todas as Categorias (Geral)</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic px-1">
                                        * O funcionário será responsável por gerir orçamentos e pedidos desta categoria.
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-border/40">
                                    <Button 
                                        type="submit" 
                                        disabled={submittingMember}
                                        className="w-full h-14 bg-primary hover:bg-navy-dark text-white font-black text-sm rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] uppercase tracking-widest"
                                    >
                                        {submittingMember ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4 mr-2 text-gold animate-pulse" />
                                                {memberFormData.id ? 'Salvar Alterações' : 'Criar Funcionário'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;
