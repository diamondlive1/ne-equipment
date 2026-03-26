import { useState, useEffect } from 'react';
import { 
    Banknote, 
    Save, 
    Loader2, 
    CheckCircle2, 
    AlertCircle,
    Building2,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/services/api';

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        bank_1_name: '',
        bank_1_account: '',
        bank_1_nib: '',
        bank_2_name: '',
        bank_2_account: '',
        bank_2_nib: '',
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/settings');
            // Merge response data with initial state to avoid undefined fields
            setSettings(prev => ({ ...prev, ...response.data }));
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/admin/settings', { settings });
            toast.success('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Configurações do Sistema</h2>
                    <p className="text-muted-foreground">Gerencie os dados bancários e informações institucionais exibidos aos clientes.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary hover:bg-navy-dark">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Alterações
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bank Account 1 */}
                <Card className="border-border shadow-sm">
                    <CardHeader className="bg-muted/30 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Banknote className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Conta Bancária 1</CardTitle>
                                <CardDescription>Dados principais para transferência.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bank_1_name">Nome do Banco</Label>
                            <Input 
                                id="bank_1_name" 
                                value={settings.bank_1_name} 
                                onChange={e => setSettings({...settings, bank_1_name: e.target.value})}
                                placeholder="Ex: Millenium BIM"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bank_1_account">Número de Conta</Label>
                            <Input 
                                id="bank_1_account" 
                                value={settings.bank_1_account} 
                                onChange={e => setSettings({...settings, bank_1_account: e.target.value})}
                                placeholder="000000000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bank_1_nib">IBAN / NIB</Label>
                            <Input 
                                id="bank_1_nib" 
                                value={settings.bank_1_nib} 
                                onChange={e => setSettings({...settings, bank_1_nib: e.target.value})}
                                placeholder="MQ06..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Account 2 */}
                <Card className="border-border shadow-sm">
                    <CardHeader className="bg-muted/30 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Banknote className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Conta Bancária 2 (Opcional)</CardTitle>
                                <CardDescription>Dados secundários para transferência.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bank_2_name">Nome do Banco</Label>
                            <Input 
                                id="bank_2_name" 
                                value={settings.bank_2_name} 
                                onChange={e => setSettings({...settings, bank_2_name: e.target.value})}
                                placeholder="Ex: Standard Bank"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bank_2_account">Número de Conta</Label>
                            <Input 
                                id="bank_2_account" 
                                value={settings.bank_2_account} 
                                onChange={e => setSettings({...settings, bank_2_account: e.target.value})}
                                placeholder="000000000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bank_2_nib">IBAN / NIB</Label>
                            <Input 
                                id="bank_2_nib" 
                                value={settings.bank_2_nib} 
                                onChange={e => setSettings({...settings, bank_2_nib: e.target.value})}
                                placeholder="MQ06..."
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm text-primary/80">
                    Estes dados serão exibidos automaticamente para o cliente na tela de <strong>Minhas Negociações</strong> assim que você enviar uma resposta ou aprovar um orçamento. Certifique-se de que os dados estão corretos para evitar problemas nos pagamentos.
                </p>
            </div>
        </div>
    );
};

export default AdminSettings;
