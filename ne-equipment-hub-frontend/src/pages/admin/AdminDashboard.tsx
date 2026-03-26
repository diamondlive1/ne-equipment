import {
  DollarSign,
  FileText,
  Package,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Upload,
  Eye,
  ShoppingCart,
  Loader2,
  CheckCircle,
  Settings,
  Save
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/* ── Helpers ── */
const getAlertStyle = (type: string) => {
  const map: Record<string, string> = {
    critical: 'border-l-4 border-l-destructive bg-destructive/5',
    success: 'border-l-4 border-l-whatsapp bg-whatsapp/5',
    warning: 'border-l-4 border-l-orange bg-orange/5',
  };
  return map[type] || '';
};

const getStatusBadge = (status: string) => {
  const map: Record<string, { label: string; className: string }> = {
    processing: { label: 'Processando', className: 'bg-primary/10 text-primary border-primary/20' },
    shipped: { label: 'Enviado', className: 'bg-blue-100/10 text-blue-700 border-blue-200/20' },
    customs: { label: 'Desembaraço', className: 'bg-orange/10 text-orange border-orange/20' },
    pending_payment: { label: 'Pag. Pendente', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    delivered: { label: 'Entregue', className: 'bg-whatsapp/10 text-whatsapp border-whatsapp/20' },
    paid: { label: 'Pago', className: 'bg-green-100 text-green-700 border-green-200' },
  };
  const s = map[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
  return <Badge variant="outline" className={s.className}>{s.label}</Badge>;
};

const formatMZN = (v: number) => {
  return (v / 1000000).toFixed(1) + 'M';
};

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [dashRes, settingsRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/settings')
        ]);
        setData(dashRes.data);
        setSettings(settingsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleUpdateSettings = async () => {
    try {
      setIsSavingSettings(true);
      await api.put('/admin/settings', { settings });
      toast.success('Configurações da loja atualizadas!');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-[500px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground font-medium animate-pulse">A carregar métricas B2B em tempo real...</p>
      </div>
    );
  }

  if (!data) return (
    <div className="p-8 text-center text-destructive">
      Erro ao carregar dados do dashboard. Verifique a conexão com o backend.
    </div>
  );

  const { kpis, revenueData, statusDistribution, funnelData, recentOrders, alerts = [] } = data;
  
  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'DollarSign': return DollarSign;
      case 'FileText': return FileText;
      case 'Package': return Package;
      case 'ShoppingCart': return ShoppingCart;
      default: return TrendingUp;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi: any, i: number) => {
          const Icon = getIcon(kpi.icon);
          return (
            <Card key={i} className="glass-card border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl bg-muted ${kpi.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs font-semibold flex items-center gap-0.5 ${
                      kpi.trend === 'up' ? 'text-whatsapp' : 'text-destructive'
                    }`}
                  >
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {kpi.change}
                  </span>
                </div>
                <p className="text-xl font-bold text-foreground leading-tight">{kpi.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions Row */}
      <div className="flex flex-wrap gap-3">
        <Button className="bg-gold hover:bg-gold-light text-navy-dark font-bold gap-2 rounded-xl shadow-sm">
          <Plus className="w-4 h-4" /> Novo Produto
        </Button>
        <Button variant="outline" className="font-semibold gap-2 border-primary text-primary rounded-xl translate-y-0 hover:-translate-y-0.5 transition-transform">
          <Upload className="w-4 h-4" /> Importar do Alibaba
        </Button>
        <Button variant="outline" className="font-semibold gap-2 rounded-xl">
          <Eye className="w-4 h-4" /> Ver Pedidos Pendentes
        </Button>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Evolução da Receita (MZN)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 88%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatMZN} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(v: number) => [`${(v / 1000000).toFixed(2)}M MT`, 'Receita']} 
                />
                <Legend iconType="circle" />
                <Area
                  type="monotone"
                  dataKey="atual"
                  name="Mês Actual"
                  stroke="hsl(210, 100%, 20%)"
                  fill="hsl(210, 100%, 20%)"
                  fillOpacity={0.15}
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="anterior"
                  name="Mês Anterior (Proj.)"
                  stroke="hsl(210, 10%, 75%)"
                  fill="hsl(210, 10%, 75%)"
                  fillOpacity={0.05}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry: any, idx: number) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-2.5">
              {statusDistribution.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-3 text-sm p-1.5 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground flex-1 truncate font-medium">{s.name}</span>
                  <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded-md min-w-[30px] text-center">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel RFQ → Pedido */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Funil de Vendas B2B
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 py-2">
              {funnelData.map((stage: any, i: number) => {
                const max = funnelData[0].value || 1;
                const pct = (stage.value / max) * 100;
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold uppercase tracking-tighter">
                      <span className="text-muted-foreground">{stage.stage}</span>
                      <span className="text-foreground">{stage.value}</span>
                    </div>
                    <div className="h-8 bg-muted rounded-xl overflow-hidden shadow-inner p-0.5">
                      <div
                        className="h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-2"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, hsl(210, 100%, 20%) 0%, hsl(43, 74%, 49%) 100%)`,
                          opacity: 0.9 - i * 0.15,
                        }}
                      >
                        <span className="text-[10px] text-white font-bold">{Math.round(pct)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      {/* Orders + Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold">Pedidos em Tempo Real</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs hover:bg-primary/5">
                Painel Completo <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="px-1 sm:px-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                      <th className="text-left py-3 font-medium">Ref. Pedido</th>
                      <th className="text-left py-3 font-medium">Cliente B2B</th>
                      <th className="text-right py-3 font-medium px-4">Valor</th>
                      <th className="text-left py-3 font-medium">Estado</th>
                      <th className="text-left py-3 font-medium">Logística</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {recentOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="py-4 font-mono font-bold text-foreground text-xs">{order.id}</td>
                        <td className="py-4">
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{order.client}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">NUIT: {order.nuit}</p>
                        </td>
                        <td className="py-4 text-right font-black text-foreground px-4">{order.value} MT</td>
                        <td className="py-4">{getStatusBadge(order.status)}</td>
                        <td className="py-4">
                           <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                             <Clock className="w-3 h-3 text-orange" />
                             <span>{order.eta} ({order.origin})</span>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Center */}
        <Card className="glass-card border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/30">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange" /> Centro de Alertas
            </CardTitle>
            <Badge variant="outline" className="border-destructive/30 text-destructive text-[10px] font-black animate-pulse">
              {alerts.filter((a) => a.type === 'critical').length} CRÍTICO(S)
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/20">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8 opacity-20" />
                  Nenhum alerta pendente
                </div>
              ) : alerts.map((alert: any, i: number) => (
                <div key={i} className={`p-4 transition-colors hover:bg-muted/10 ${getAlertStyle(alert.type)}`}>
                  <p className="text-xs font-medium text-foreground leading-relaxed">{alert.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {alert.time}
                  </p>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full text-xs text-muted-foreground py-3 h-auto hover:bg-muted/50 font-semibold">
              Ver histórico de notificações
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Loja Settings Section */}
      <Card className="glass-card border-border/50 shadow-sm overflow-hidden mt-6">
        <CardHeader className="bg-muted/30 pb-3 border-b border-border/10">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> Configurações de Pagamento (Dados Bancários)
          </CardTitle>
          <p className="text-xs text-muted-foreground">Estes dados serão exibidos dinamicamente aos clientes quando as cotações forem aprovadas.</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Banco 1 */}
            <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border/30">
              <h4 className="font-bold text-sm text-primary uppercase tracking-wider">Banco Principal</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Nome do Banco</label>
                  <input 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={settings.bank_1_name || ''}
                    onChange={(e) => handleSettingChange('bank_1_name', e.target.value)}
                    placeholder="Ex: Millennium BIM"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Nº Conta</label>
                    <input 
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={settings.bank_1_account || ''}
                      onChange={(e) => handleSettingChange('bank_1_account', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground px-1">NIB</label>
                    <input 
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={settings.bank_1_nib || ''}
                      onChange={(e) => handleSettingChange('bank_1_nib', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Banco 2 */}
            <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border/30">
              <h4 className="font-bold text-sm text-whatsapp uppercase tracking-wider">Banco Secundário</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Nome do Banco</label>
                  <input 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={settings.bank_2_name || ''}
                    onChange={(e) => handleSettingChange('bank_2_name', e.target.value)}
                    placeholder="Ex: BCI"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Nº Conta</label>
                    <input 
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={settings.bank_2_account || ''}
                      onChange={(e) => handleSettingChange('bank_2_account', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground px-1">NIB</label>
                    <input 
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={settings.bank_2_nib || ''}
                      onChange={(e) => handleSettingChange('bank_2_nib', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleUpdateSettings} 
              disabled={isSavingSettings}
              className="bg-navy-dark text-white font-bold gap-2 px-8 rounded-xl h-11 shadow-lg hover:shadow-xl transition-all"
            >
              {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Configurações da Loja
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
