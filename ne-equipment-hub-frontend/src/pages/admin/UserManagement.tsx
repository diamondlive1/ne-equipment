import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, 
    Plus, 
    Search, 
    Shield, 
    User as UserIcon, 
    Mail, 
    Phone, 
    Clock, 
    MoreVertical,
    Loader2,
    X,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/services/api';
import { cn } from '@/lib/utils';

const UserManagement = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'customer',
        password: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users');
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Erro ao carregar utilizadores');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/admin/users', formData);
            toast.success('Utilizador criado com sucesso!');
            setIsModalOpen(false);
            setFormData({ name: '', email: '', phone: '', role: 'customer', password: '' });
            fetchUsers();
        } catch (error: any) {
            console.error('Error creating user:', error);
            const message = error.response?.data?.message || 'Erro ao criar utilizador';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gestão de Utilizadores</h2>
                    <p className="text-muted-foreground">Adicione e gira os acessos da plataforma.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-primary hover:bg-navy-dark rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
                    <Plus className="w-5 h-5" />
                    Novo Utilizador
                </Button>
            </div>

            <Card className="glass-card border-border/50">
                <CardHeader className="pb-3 border-b border-border/10">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" /> Lista de Utilizadores
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Pesquisar por nome ou email..." 
                                className="pl-9 h-10 bg-muted/30 border-border/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border/10">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Utilizador</th>
                                    <th className="px-6 py-4 font-bold">Contacto</th>
                                    <th className="px-6 py-4 font-bold">Função / Role</th>
                                    <th className="px-6 py-4 font-bold">Estado</th>
                                    <th className="px-6 py-4 font-bold text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                <p className="text-muted-foreground">A carregar utilizadores...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            Nenhum utilizador encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground">{user.name}</p>
                                                        <p className="text-[11px] text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                                        <Phone className="w-3 h-3 text-primary/60" />
                                                        {user.phone || 'Sem telefone'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                                                        <Clock className="w-3 h-3 text-primary/60" />
                                                        Desde {new Date(user.created_at).toLocaleDateString('pt-MZ')}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge 
                                                    variant="outline" 
                                                    className={cn(
                                                        "font-bold text-[10px] uppercase px-2 py-0.5",
                                                        user.role === 'admin' 
                                                            ? "bg-navy-dark text-white border-none" 
                                                            : "bg-primary/5 text-primary border-primary/20"
                                                    )}
                                                >
                                                    {user.role === 'admin' ? 'Administrador' : 'Cliente B2B'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-whatsapp text-[11px] font-bold">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-whatsapp animate-pulse" />
                                                    Ativo
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl border border-border w-full max-w-md overflow-hidden"
                    >
                        <div className="p-6 border-b border-border bg-muted/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl text-primary font-bold">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Criar Novo Utilizador</h3>
                                        <p className="text-xs text-muted-foreground font-medium">Preencha os dados do utilizador abaixo.</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-muted-foreground px-1">Nome Completo</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input 
                                        required
                                        placeholder="Ex: Celso Raimundo" 
                                        className="pl-9 h-11 bg-muted/10 border-border/30 rounded-xl focus:ring-primary/20"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-muted-foreground px-1">Email Profissional</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input 
                                            required
                                            type="email"
                                            placeholder="email@empresa.com" 
                                            className="pl-9 h-11 bg-muted/10 border-border/30 rounded-xl focus:ring-primary/20"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-muted-foreground px-1">Telemóvel</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input 
                                            placeholder="+258..." 
                                            className="pl-9 h-11 bg-muted/10 border-border/30 rounded-xl focus:ring-primary/20"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-muted-foreground px-1">Função na Plataforma</label>
                                <select 
                                    className="w-full h-11 rounded-xl border border-border/30 bg-muted/10 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="customer">Cliente B2B (Visualização/RFQs)</option>
                                    <option value="admin">Administrador (Controle Total)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-muted-foreground px-1">Palavra-passe Inicial</label>
                                <Input 
                                    required
                                    type="password"
                                    placeholder="Mínimo 6 caracteres" 
                                    className="h-11 bg-muted/10 border-border/30 rounded-xl focus:ring-primary/20"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>

                            <div className="pt-2">
                                <Button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="w-full h-12 bg-primary hover:bg-navy-dark text-white font-bold rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                    )}
                                    Criar Utilizador Agora
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
