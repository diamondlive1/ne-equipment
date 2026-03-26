import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Gavel, 
  Package, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  BadgeCent
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

interface DashboardHomeProps {
  onNavigate: (section: string) => void;
}

const DashboardHome = ({ onNavigate }: DashboardHomeProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    responded: 0
  });
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/quotes');
        const quotes = response.data;
        
        setStats({
          total: quotes.length,
          pending: quotes.filter((q: any) => q.status === 'pending').length,
          approved: quotes.filter((q: any) => q.status === 'approved' || q.status === 'completed').length,
          responded: quotes.filter((q: any) => q.status === 'responded').length
        });
        
        setRecentQuotes(quotes.slice(0, 3));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const userName = user?.name || 'Cliente';

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold text-navy-dark mb-3">Bem-vindo, {userName}.</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            Aqui está o resumo da sua actividade B2B. Você pode acompanhar as suas 
            <button onClick={() => onNavigate('quotes')} className="text-navy hover:underline font-bold px-1 text-primary">negociações de preço</button> 
            e gerir os seus pedidos de volume.
          </p>
        </div>
        <Button onClick={() => window.location.href = '/'} className="bg-gold hover:bg-gold-light text-navy-dark font-bold rounded-xl gap-2">
           Ir para o Catálogo
           <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:border-primary/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total de Orçamentos</p>
          <p className="text-3xl font-black text-navy-dark">{stats.total}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:border-gold/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-gold/5 flex items-center justify-center text-gold mb-4 group-hover:bg-gold group-hover:text-navy-dark transition-all">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Aguardando Resposta</p>
          <p className="text-3xl font-black text-navy-dark">{stats.pending}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:border-blue-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-500/5 flex items-center justify-center text-blue-500 mb-4 group-hover:bg-blue-500 group-hover:text-white transition-all">
            <TrendingDown className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Em Negociação</p>
          <p className="text-3xl font-black text-navy-dark">{stats.responded}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:border-whatsapp/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-whatsapp/5 flex items-center justify-center text-whatsapp mb-4 group-hover:bg-whatsapp group-hover:text-white transition-all">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Aprovados / Pagos</p>
          <p className="text-3xl font-black text-navy-dark">{stats.approved}</p>
        </div>
      </div>

      {/* Recent Quotes Section */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg text-navy-dark flex items-center gap-2">
            <Package className="w-5 h-5 text-gold" />
            Últimas Negociações
          </h3>
          <button onClick={() => onNavigate('quotes')} className="text-sm font-bold text-primary hover:underline flex items-center gap-1 text-navy-dark">
            Ver todas <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-0">
          {loading ? (
             <div className="p-8 text-center text-muted-foreground">Carregando actividade recente...</div>
          ) : recentQuotes.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Ainda não tem nenhuma negociação activa.</p>
              <Button onClick={() => window.location.href = '/'} variant="outline" className="rounded-xl border-dashed">
                Explorar Equipamentos
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentQuotes.map((quote) => (
                <div key={quote.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => onNavigate('quotes')}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all font-mono font-bold text-xs">
                      #{quote.quote_number.slice(-3)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{quote.items[0]?.product?.name || 'Pedido de Equipamento'}</h4>
                      <p className="text-[11px] text-muted-foreground">{quote.items.length} item(ns) • Total: {Number(quote.total_estimated_value).toLocaleString('pt-MZ')} MT</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      quote.status === 'pending' ? 'bg-gray-100 text-gray-600' :
                      quote.status === 'responded' ? 'bg-blue-100 text-blue-600' :
                      quote.status === 'approved' ? 'bg-green-100 text-green-600' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {quote.status}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
