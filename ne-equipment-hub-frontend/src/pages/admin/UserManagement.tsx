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
    Clock, 
    MoreVertical,
    Loader2,
    X,
    CheckCircle2,
    Building2,
    Trash2,
    Briefcase,
    Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from "@/components/ui/tabs";
import { toast } from 'sonner';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('members');
    
    // Member search/filter
    const [memberSearchTerm, setMemberSearchTerm] = useState('');
    
    // Member Modals
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [submittingMember, setSubmittingMember] = useState(false);
    const [memberFormData, setMemberFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'admin',
        team_id: '',
        password: ''
    });

    // Team Modals
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [submittingTeam, setSubmittingTeam] = useState(false);
    const [teamFormData, setTeamFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, teamsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/teams')
            ]);
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            setTeams(Array.isArray(teamsRes.data) ? teamsRes.data : []);
        } catch (error) {
            console.error('Error fetching management data:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingMember(true);
        try {
            await api.post('/admin/users', memberFormData);
            toast.success('Membro adicionado com sucesso!');
            setIsMemberModalOpen(false);
            setMemberFormData({ name: '', email: '', phone: '', role: 'admin', team_id: '', password: '' });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao adicionar membro');
        } finally {
            setSubmittingMember(false);
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingTeam(true);
        try {
            await api.post('/admin/teams', teamFormData);
            toast.success('Equipa criada com sucesso!');
            setIsTeamModalOpen(false);
            setTeamFormData({ name: '', description: '' });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao criar equipa');
        } finally {
            setSubmittingTeam(false);
        }
    };

    const handleDeleteTeam = async (id: number) => {
        if (!confirm('Tem certeza que deseja remover esta equipa?')) return;
        try {
            await api.delete(`/admin/teams/${id}`);
            toast.success('Equipa removida');
            fetchData();
        } catch (error) {
            toast.error('Erro ao remover equipa');
        }
    };

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(memberSearchTerm.toLowerCase()) || 
        user.email?.toLowerCase().includes(memberSearchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Minha Equipa & Estrutura</h2>
                    <p className="text-muted-foreground">Administre os membros e a organização da sua empresa.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-xl border border-border/50">
                    <TabsTrigger value="members" className="rounded-lg px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Users className="w-4 h-4 mr-2 text-primary" />
                        Trabalhadores
                    </TabsTrigger>
                    <TabsTrigger value="teams" className="rounded-lg px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Building2 className="w-4 h-4 mr-2 text-gold" />
                        Equipas / Departamentos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="space-y-6 outline-none">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Procurar trabalhador..." 
                                className="pl-9 bg-card border-border/50 h-10 rounded-xl"
                                value={memberSearchTerm}
                                onChange={(e) => setMemberSearchTerm(e.target.value)}
                            />
                        </div>
                        {currentUser?.is_superadmin && (
                            <Button onClick={() => setIsMemberModalOpen(true)} className="gap-2 bg-primary hover:bg-navy-dark rounded-xl h-11 px-6 shadow-lg shadow-primary/20 w-full sm:w-auto">
                                <Plus className="w-5 h-5" />
                                Adicionar Trabalhador
                            </Button>
                        )}
                    </div>

                    <Card className="glass-card border-border/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border/10">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Membro</th>
                                        <th className="px-6 py-4 font-bold">Equipa / Dep</th>
                                        <th className="px-6 py-4 font-bold">Acesso</th>
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
                                                    <p className="text-muted-foreground">A carregar...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                                Nenhum membro encontrado.
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
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 rounded bg-gold/10 text-gold">
                                                            <Building2 className="w-3 h-3" />
                                                        </div>
                                                        <span className="text-xs font-semibold">{user.team?.name || 'Sem Equipa'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge 
                                                        variant="outline" 
                                                        className={cn(
                                                            "font-bold text-[10px] uppercase px-2 py-0.5",
                                                            user.is_superadmin 
                                                                ? "bg-navy-dark text-white border-none" 
                                                                : "bg-primary/5 text-primary border-primary/20"
                                                        )}
                                                    >
                                                        {user.is_superadmin ? 'Superadmin' : 'Staff'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-whatsapp text-[11px] font-bold">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-whatsapp animate-pulse" />
                                                        Ativo
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full hover:bg-muted">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="teams" className="space-y-6 outline-none">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            Organize os seus trabalhadores por departamentos ou funções específicas.
                        </p>
                        {currentUser?.is_superadmin && (
                            <Button onClick={() => setIsTeamModalOpen(true)} className="gap-2 bg-gold hover:bg-gold/90 text-navy-dark rounded-xl h-11 px-6 shadow-lg shadow-gold/20 w-full sm:w-auto font-bold border-none">
                                <Plus className="w-5 h-5" />
                                Criar Equipa / Departamento
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full py-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                            </div>
                        ) : teams.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-muted/5 rounded-3xl border border-dashed border-border/60">
                                <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="font-bold text-lg text-muted-foreground">Nenhuma equipa configurada</h3>
                                <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto mt-1">Crie a sua primeira equipa para começar a organizar o seu staff.</p>
                                <Button variant="outline" onClick={() => setIsTeamModalOpen(true)} className="mt-6 rounded-xl border-border/50">
                                    Criar agora
                                </Button>
                            </div>
                        ) : (
                            teams.map((team) => (
                                <motion.div key={team.id} whileHover={{ y: -5 }}>
                                    <Card className="glass-card overflow-hidden border-border/50 group h-full flex flex-col">
                                        <div className="h-1.5 w-full bg-gold/40" />
                                        <CardHeader className="pb-2 flex-row justify-between items-start">
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl font-black text-navy-dark">{team.name}</CardTitle>
                                                <CardDescription className="text-xs line-clamp-2">{team.description || 'Departamento interno da NE Equipment.'}</CardDescription>
                                            </div>
                                            {currentUser?.is_superadmin && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleDeleteTeam(team.id)}
                                                    className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 -mt-2 -mr-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </CardHeader>
                                        <CardContent className="mt-auto pt-4 flex items-center justify-between border-t border-border/30 bg-muted/5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-1.5">
                                                    {[...Array(Math.min(3, team.users_count))].map((_, i) => (
                                                        <div key={i} className="w-5 h-5 rounded-full border border-background bg-primary/20 flex items-center justify-center text-[8px] font-black text-primary uppercase">
                                                            {team.users_count > 0 ? "ST" : ""}
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                                    {team.users_count} Membros
                                                </span>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tight text-gold border-gold/30">
                                                Activo
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

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
                                            <h3 className="font-bold text-2xl">Novo Trabalhador</h3>
                                            <p className="text-xs text-white/60 font-medium">Configure os dados de acesso administrativo.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsMemberModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                        <X className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleCreateMember} className="p-8 space-y-6 h-auto max-h-[70vh] overflow-y-auto">
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
                                    <div className="space-y-2 col-span-full">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Senha de Acesso</label>
                                        <Input 
                                            required
                                            type="password"
                                            placeholder="Min: 6 chars" 
                                            className="h-12 bg-muted/20 border-border/30 rounded-2xl focus:ring-primary/20 text-sm"
                                            value={memberFormData.password}
                                            onChange={(e) => setMemberFormData({...memberFormData, password: e.target.value})}
                                        />
                                    </div>
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
                                                Criar Funcionário
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal para Criar Equipa */}
            <AnimatePresence>
                {isTeamModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl border border-border w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-border bg-gold text-navy-dark relative">
                                <div className="absolute top-0 right-0 p-6 opacity-10 text-black">
                                    <Building2 className="w-24 h-24" />
                                </div>
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-navy-dark/10 rounded-xl">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-black text-xl uppercase tracking-tighter">Criar Equipa</h3>
                                    </div>
                                    <button onClick={() => setIsTeamModalOpen(false)} className="p-2 hover:bg-navy-dark/10 rounded-full transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Nome do Departamento</label>
                                    <Input 
                                        required
                                        placeholder="Ex: Logística, Vendas, Admin..." 
                                        className="h-11 bg-muted/10 border-border/30 rounded-xl focus:ring-gold/20"
                                        value={teamFormData.name}
                                        onChange={(e) => setTeamFormData({...teamFormData, name: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Breve Descrição</label>
                                    <Textarea 
                                        placeholder="O que este departamento faz?" 
                                        className="bg-muted/10 border-border/30 rounded-xl focus:ring-gold/20 min-h-[100px] text-sm resize-none"
                                        value={teamFormData.description}
                                        onChange={(e) => setTeamFormData({...teamFormData, description: e.target.value})}
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button 
                                        type="submit" 
                                        disabled={submittingTeam}
                                        className="w-full h-12 bg-navy-dark hover:bg-navy text-white font-black text-xs rounded-xl shadow-xl shadow-navy-dark/20 transition-all active:scale-[0.98] uppercase tracking-widest"
                                    >
                                        {submittingTeam ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            "Publicar Equipa"
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
