import { useState, useEffect } from 'react';
import { 
  Search, 
  MessageSquare, 
  Gavel, 
  TrendingDown, 
  ChevronRight, 
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Banknote,
  FileDown,
  Building,
  FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/services/api';
import { formatDistanceToNow, format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateQuotePDF } from '@/utils/pdfGenerator';

const safeFormatDistance = (dateStr: string | undefined | null) => {
  if (!dateStr) return 'agora mesmo';
  const date = new Date(dateStr);
  if (!isValid(date)) return 'recentemente';
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
};

const safeFormat = (dateStr: string | undefined | null, formatStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (!isValid(date)) return '';
  return format(date, formatStr, { locale: ptBR });
};

interface QuoteItem {
  id: number;
  product_id: number;
  quantity: number;
  requested_price: number | null;
  approved_price: number | null;
  product: { name: string; images?: { image_path: string; is_primary: boolean }[] };
}

interface QuoteMessage {
  id: number;
  message: string;
  is_admin: boolean;
  user: { name: string };
  created_at: string;
}

interface Quote {
  id: number;
  quote_number: string;
  status: string;
  total_estimated_value: number;
  created_at: string;
  updated_at: string;
  user: { name: string; email: string };
  items: QuoteItem[];
  messages: QuoteMessage[];
  invoice_path: string | null;
  expires_at: string | null;
  delivery_info: string | null;
}

const MyQuotes = () => {
  const [search, setSearch] = useState('');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quotesRes, settingsRes] = await Promise.all([
          api.get('/quotes'),
          api.get('/settings')
        ]);
        setQuotes(quotesRes.data);
        setSettings(settingsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedQuote) return;
    try {
      setSendingMsg(true);
      const res = await api.post(`/quotes/${selectedQuote.id}/messages`, { message: newMessage });
      const newMsg = res.data.message;

      // Update the local state
      setQuotes(prev => prev.map(q => {
        if (q.id === selectedQuote.id) {
          const updatedQuote = { ...q, messages: [...(q.messages || []), newMsg] };
          if (selectedQuote.id === q.id) setSelectedQuote(updatedQuote);
          return updatedQuote;
        }
        return q;
      }));
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSendingMsg(false);
    }
  };

  useEffect(() => {
    if (!chatOpen || !selectedQuote) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/quotes/${selectedQuote.id}/messages`);
        const updatedMessages = res.data;
        
        setQuotes(prev => prev.map(q => {
          if (q.id === selectedQuote.id) {
            return { ...q, messages: updatedMessages };
          }
          return q;
        }));

        setSelectedQuote(prev => {
          if (prev?.id === selectedQuote.id) {
            return { ...prev, messages: updatedMessages };
          }
          return prev;
        });
      } catch (error) {
        console.error('Error polling client messages:', error);
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [chatOpen, selectedQuote?.id]);

  const handleReportPayment = async (quoteId: number) => {
    try {
      const res = await api.post(`/quotes/${quoteId}/report-payment`);
      toast.success('Pagamento reportado com sucesso! A loja foi notificada.');
      setQuotes(prev => prev.map(q => q.id === quoteId ? res.data.quote : q));
      if (selectedQuote?.id === quoteId) {
        setSelectedQuote(res.data.quote);
      }
    } catch (error) {
      console.error('Error reporting payment:', error);
      toast.error('Erro ao reportar pagamento. Tente novamente.');
    }
  };

  const filtered = quotes.filter(q => {
    const matchId = (q.quote_number || "").toLowerCase().includes(search.toLowerCase());
    const matchProduct = q.items[0]?.product?.name?.toLowerCase().includes(search.toLowerCase()) || false;
    return matchId || matchProduct;
  });

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'responded': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'payment_reported': return 'bg-orange-100 text-orange-700 border-orange-200 animate-pulse';
      case 'completed': return 'bg-whatsapp/20 text-whatsapp border-whatsapp/30';
      case 'converted': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    responded: 'Aguardando Aprovação',
    approved: 'Preço Aprovado',
    payment_reported: 'Pagamento em Análise',
    completed: 'Concluído (Pago)',
    rejected: 'Cancelado',
    converted: 'Pedido Gerado'
  };

  const openQuotes = quotes.filter(q => q.status === 'pending' || q.status === 'responded').length;
  const waitingResponse = quotes.filter(q => q.status === 'responded').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold flex-shrink-0"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-navy-dark tracking-tight flex items-center gap-3">
            <Gavel className="w-8 h-8 text-gold" />
            Centro de Negociação B2B
          </h2>
          <p className="text-muted-foreground mt-1">Gira os seus orçamentos de volume e negocie preços directos.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar negociações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-white border-gray-200 shadow-sm focus:ring-gold/20"
          />
        </div>
      </div>

      {/* Negotiation Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-navy-dark/5 rounded-2xl border border-navy-dark/10">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Abertas</p>
          <p className="text-2xl font-bold text-navy-dark">{openQuotes}</p>
        </div>
        <div className="p-4 bg-whatsapp/5 rounded-2xl border border-whatsapp/10">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Aprovação Final</p>
          <p className="text-2xl font-bold text-whatsapp">{quotes.filter(q=>q.status==='approved').length}</p>
        </div>
        <div className="p-4 bg-gold/5 rounded-2xl border border-gold/10">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Aguardando Resposta</p>
          <p className="text-2xl font-bold text-gold">{waitingResponse}</p>
        </div>
      </div>

      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2 pb-4 pt-1 rounded-lg">
        {filtered.length > 0 ? filtered.map((quote) => {
          const firstItem = quote.items[0];
          const primaryImage = firstItem?.product?.images?.find((i: any) => i.is_primary)?.image_path || firstItem?.product?.images?.[0]?.image_path;
          const imageUrl = primaryImage ? (primaryImage.startsWith('data:image') || primaryImage.startsWith('http') ? primaryImage : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${primaryImage}`) : '/placeholder-product.png';
          const displayedPrice = quote.total_estimated_value > 0 ? (Number(quote.total_estimated_value)).toLocaleString('pt-MZ') : 'A definir';

          return (
          <div key={quote.id} className="group bg-white rounded-2xl border border-gray-200 hover:border-gold/50 shadow-sm transition-all overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Product Info */}
                <div className="w-24 h-24 rounded-xl border border-gray-100 p-2 flex-shrink-0 bg-gray-50 group-hover:bg-white transition-colors">
                  <img src={imageUrl} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                       <Badge variant="outline" className={`px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wide ${getStatusStyle(quote.status)}`}>
                        {statusLabels[quote.status] || quote.status}
                       </Badge>
                       <span className="text-xs text-muted-foreground font-mono">#{quote.quote_number}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                       <Clock className="w-3.5 h-3.5" />
                       Atualizado {safeFormatDistance(quote.updated_at)}
                    </div>
                    {quote.expires_at && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-full font-bold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Expira em {safeFormat(quote.expires_at, "dd/MM/yyyy")}
                      </div>
                    )}
                    {quote.delivery_info && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full font-bold">
                        <Truck className="w-3.5 h-3.5" />
                        {quote.delivery_info}
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-navy transition-colors">
                    {firstItem?.product?.name} {quote.items.length > 1 && `e mais ${quote.items.length - 1} item(ns)`}
                  </h3>
                  
                  {/* Price Comparison UI */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-1">
                        Total Estimado <TrendingDown className="w-3 h-3 text-whatsapp" />
                      </p>
                      <p className="text-lg font-black text-navy-dark">{displayedPrice} {quote.total_estimated_value > 0 && 'MT'}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:w-48 flex flex-col justify-center gap-2 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                  <Button 
                    onClick={() => { setSelectedQuote(quote); setChatOpen(true); }}
                    className="w-full bg-navy-dark hover:bg-navy text-white font-bold gap-2 text-sm rounded-xl"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat ({quote.messages?.length || 0})
                  </Button>
                  {quote.status === 'approved' && (
                    <Button onClick={() => handleReportPayment(quote.id)} className="w-full bg-gold hover:bg-gold-light text-navy-dark font-bold gap-2 text-sm rounded-xl animate-in zoom-in duration-300">
                      <Banknote className="w-4 h-4" />
                      Confirmar Pagamento
                    </Button>
                  )}
                  {quote.status === 'payment_reported' && (
                    <Button disabled className="w-full bg-orange-100 text-orange-700 font-bold gap-2 text-xs rounded-xl border border-orange-200">
                      <Clock className="w-4 h-4" />
                      Em Análise...
                    </Button>
                  )}
                  {quote.status === 'completed' && (
                    <Button disabled className="w-full bg-whatsapp/10 text-whatsapp font-bold gap-2 text-xs rounded-xl border border-whatsapp/20">
                      <CheckCircle2 className="w-4 h-4" />
                      Pagamento Confirmado
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => generateQuotePDF(quote, settings)} 
                    className="w-full font-bold border-gold text-gold hover:bg-gold hover:text-navy-dark gap-2 text-sm rounded-xl"
                  >
                    <FileDown className="w-4 h-4" />
                    Exportar PDF
                  </Button>
                  <Button variant="outline" onClick={() => { setSelectedQuote(quote); setChatOpen(true); }} className="w-full font-semibold border-gray-200 text-gray-600 gap-2 text-sm rounded-xl">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
              <Gavel className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Sem negociações activas</h3>
            <p className="text-sm text-muted-foreground mt-1">Solicite uma cotação no carrinho para iniciar uma negociação.</p>
          </div>
        )}
      </div>

      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-2xl sm:max-w-3xl">
          <DialogHeader className="flex flex-row items-center justify-between gap-4">
            <DialogTitle>Chat da Negociação: #{selectedQuote?.quote_number}</DialogTitle>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => selectedQuote && generateQuotePDF(selectedQuote, settings)}
              className="border-gold text-gold hover:bg-gold hover:text-navy-dark font-bold gap-2 rounded-lg"
            >
              <FileDown className="w-4 h-4" />
              Exportar PDF
            </Button>
          </DialogHeader>
          <div className="flex flex-col h-[60vh] min-h-[400px] max-h-[600px]">
            <div className="flex-1 overflow-y-auto bg-muted/20 p-3 space-y-3 rounded-md border border-border">
                {/* Quote Summary Table for Client */}
                {selectedQuote && (
                  <div className="bg-white border border-border rounded-lg overflow-hidden mb-3">
                    <div className="bg-muted/30 px-3 py-2 border-b border-border">
                      <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Resumo da Proposta Atual
                      </h4>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-muted/10 text-[9px] uppercase font-bold text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-3 py-1 w-10"></th>
                          <th className="px-3 py-1">Produto</th>
                          <th className="px-1 py-1 text-center">Qtd</th>
                          <th className="px-3 py-1 text-right">Total c/ IVA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50 text-[11px]">
                        {selectedQuote.items.map((item, idx) => {
                          const p = item.approved_price || item.requested_price || 0;
                          const totalWithIva = (p * item.quantity) * 1.16;
                          return (
                            <tr key={idx} className="hover:bg-muted/5">
                              <td className="px-3 py-2">
                                <div className="w-8 h-8 rounded border border-border overflow-hidden bg-muted/20">
                                  {(() => {
                                      const primaryImage = item.product?.images?.find((img: any) => img.is_primary)?.image_path || item.product?.images?.[0]?.image_path;
                                      const imageUrl = primaryImage
                                        ? (primaryImage.startsWith('data:image') || primaryImage.startsWith('http') ? primaryImage : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${primaryImage}`)
                                        : '/placeholder-product.png';
                                      return <img src={imageUrl} alt="" className="w-full h-full object-cover" />;
                                  })()}
                                </div>
                              </td>
                              <td className="px-3 py-2 font-medium">{item.product?.name}</td>
                              <td className="px-1 py-2 text-center text-muted-foreground">{item.quantity}</td>
                              <td className="px-3 py-2 text-right font-bold text-primary">
                                {totalWithIva.toLocaleString('pt-MZ')} MT
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-primary/5 text-[11px] font-bold">
                        <tr>
                          <td colSpan={2} className="px-3 py-2 text-right uppercase text-[9px]">Total Final (c/ IVA):</td>
                          <td className="px-3 py-2 text-right text-primary text-sm">
                            {(selectedQuote.items.reduce((sum, item) => sum + (item.approved_price || item.requested_price || 0) * item.quantity, 0) * 1.16).toLocaleString('pt-MZ')} MT
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {/* Bank Details section */}
                {(selectedQuote?.status === 'approved' || selectedQuote?.status === 'converted' || selectedQuote?.status === 'responded') && (
                  <div className="bg-navy-dark text-white p-3 rounded-lg shadow-md border-l-4 border-gold mb-2 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Banknote className="w-4 h-4 text-gold" />
                      <h4 className="font-bold text-[11px] uppercase tracking-wider">Dados para Transferência Bancária</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      {settings.bank_1_name && (
                        <div className="space-y-1 bg-white/10 p-2 rounded-lg">
                          <p className="text-gold font-bold">{settings.bank_1_name}</p>
                          <p className="font-mono">Conta: {settings.bank_1_account}</p>
                          <p className="font-mono">IBAN/NIB: {settings.bank_1_nib}</p>
                        </div>
                      )}
                      {settings.bank_2_name && (
                        <div className="space-y-1 bg-white/10 p-2 rounded-lg">
                          <p className="text-gold font-bold">{settings.bank_2_name}</p>
                          <p className="font-mono">Conta: {settings.bank_2_account}</p>
                          <p className="font-mono">IBAN/NIB: {settings.bank_2_nib}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] mt-3 text-white/70 italic">
                      * Por favor, envie o comprovativo pelo chat abaixo após a transferência.
                    </p>
                  </div>
                )}

                {/* Invoice download section */}
                {selectedQuote?.invoice_path && (
                  <div className="bg-whatsapp/10 border border-whatsapp/20 p-2 px-3 rounded-lg flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-whatsapp/20 p-2 rounded-lg">
                        <FileText className="w-5 h-5 text-whatsapp" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-navy-dark">Factura / Recibo Disponível</p>
                        <p className="text-[10px] text-muted-foreground">Documento oficial emitido pela NE Equipment</p>
                      </div>
                    </div>
                    <Button asChild size="sm" className="bg-whatsapp hover:bg-whatsapp-dark text-white gap-2 rounded-lg font-bold">
                      <a 
                        href={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${selectedQuote.invoice_path}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <FileDown className="w-4 h-4" />
                        Baixar
                      </a>
                    </Button>
                  </div>
                )}

                {selectedQuote?.messages?.length === 0 ? (
                  <p className="text-center text-muted-foreground mt-6 text-sm">Nenhuma mensagem ainda.</p>
                ) : selectedQuote?.messages?.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${!msg.is_admin ? 'items-end' : 'items-start'}`}>
                    <div className={`p-2 px-3 rounded-xl max-w-[85%] text-[13px] ${!msg.is_admin ? 'bg-gold text-navy-dark rounded-tr-sm rounded-br-none font-medium shadow-sm' : 'bg-white border border-gray-200 rounded-tl-sm rounded-bl-none shadow-sm'}`}>
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      {!msg.is_admin ? 'Você' : 'Suporte NE'} • {safeFormat(msg.created_at, "HH:mm, dd/MM")}
                    </span>
                  </div>
                ))}
            </div>
            <div className="pt-3 flex gap-2">
              <Textarea 
                placeholder="Escreva a sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="resize-none h-full min-h-[50px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button disabled={!newMessage.trim() || sendingMsg} onClick={handleSendMessage} className="bg-gold hover:bg-gold-light text-navy-dark h-auto px-6 font-bold">
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyQuotes;
