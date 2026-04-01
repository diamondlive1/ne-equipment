import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, FileText, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const safeDateFormat = (dateStr: string | undefined | null, formatStr: string) => {
  if (!dateStr) return 'Recente';
  const date = new Date(dateStr);
  if (!isValid(date)) return 'Recente';
  return format(date, formatStr, { locale: ptBR });
};
import api from '@/services/api';

interface Quote {
  id: number;
  quote_number: string;
  status: string;
  total_estimated_value: number;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

interface AdminQuoteListProps {
  onViewQuote: (quoteId: number) => void;
}

export default function AdminQuoteList({ onViewQuote }: AdminQuoteListProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await api.get('/admin/quotes');
      setQuotes(response.data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    responded: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    approved: 'bg-green-500/10 text-green-500 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    converted: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    responded: 'Respondida',
    approved: 'Aprovada / Aguardando',
    rejected: 'Rejeitada',
    converted: 'Convertida em Pedido',
  };

  const filteredQuotes = quotes.filter(q => 
    (q.quote_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Negociações (RFQs)</h2>
          <p className="text-muted-foreground">
            Gerencie cotações de clientes e defina preços B2B.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por número ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[65vh] [direction:rtl]">
          <table className="w-full text-sm text-left [direction:ltr]">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-medium bg-muted/50">Nº Cotação</th>
                <th className="px-6 py-4 font-medium bg-muted/50">Cliente</th>
                <th className="px-6 py-4 font-medium bg-muted/50">Data</th>
                <th className="px-6 py-4 font-medium bg-muted/50">Valor Total</th>
                <th className="px-6 py-4 font-medium bg-muted/50">Status</th>
                <th className="px-6 py-4 font-medium text-right bg-muted/50">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    Nenhuma cotação encontrada.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <motion.tr 
                    key={quote.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold">#{quote.quote_number}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{quote.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{quote.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {safeDateFormat(quote.created_at, "dd 'de' MMM, yyyy")}
                    </td>
                    <td className="px-6 py-4 font-medium italic text-muted-foreground">
                      {quote.total_estimated_value > 0 
                        ? `${quote.total_estimated_value.toLocaleString('pt-MZ')} MT` 
                        : 'A definir'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={statusColors[quote.status]}>
                        {statusLabels[quote.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => onViewQuote(quote.id)}
                      >
                        <Eye className="w-4 h-4" />
                        Ver / Negociar
                      </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
