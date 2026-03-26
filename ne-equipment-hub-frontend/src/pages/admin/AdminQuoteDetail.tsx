import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  Save,
  User,
  Building,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
  Send,
  MessageSquare,
  Upload,
  FileDown,
  RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import api from '@/services/api';
import { generateQuotePDF } from '@/utils/pdfGenerator';

const safeDateFormat = (dateStr: string | undefined | null, formatStr: string) => {
  if (!dateStr) return 'Data não disponível';
  const date = new Date(dateStr);
  if (!isValid(date)) return 'Data inválida';
  return format(date, formatStr, { locale: ptBR });
};

interface QuoteMessage {
  id: number;
  message: string;
  is_admin: boolean;
  user: { name: string };
  created_at: string;
}

interface QuoteItem {
  id: string | number;
  product_id: number;
  quantity: number;
  requested_price: number | null;
  approved_price: number | null;
  product: {
    name: string;
    description: string;
    images?: { image_path: string; is_primary: boolean }[];
  };
}

interface QuoteDetail {
  id: number;
  quote_number: string;
  status: string;
  total_estimated_value: number;
  admin_notes: string;
  created_at: string;
  company_name: string | null;
  vat_number: string | null;
  contact_email: string | null;
  user: {
    name: string;
    email: string;
  };
  items: QuoteItem[];
  invoice_path: string | null;
}

interface AdminQuoteDetailProps {
  quoteId: number;
  onBack: () => void;
}

export default function AdminQuoteDetail({ quoteId, onBack }: AdminQuoteDetailProps) {
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editedItems, setEditedItems] = useState<Record<string | number, string>>({});
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [messages, setMessages] = useState<QuoteMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetchQuoteDetail();
  }, [quoteId]);

  const fetchQuoteDetail = async () => {
    try {
      setLoading(true);
      const [quoteRes, messagesRes, settingsRes] = await Promise.all([
        api.get(`/admin/quotes/${quoteId}`),
        api.get(`/admin/quotes/${quoteId}/messages`),
        api.get('/settings')
      ]);
      setQuote(quoteRes.data);
      setAdminNotes(quoteRes.data.admin_notes || '');
      setStatus(quoteRes.data.status);
      setSettings(settingsRes.data);

      const itemsMap: Record<string | number, string> = {};
      quoteRes.data.items.forEach((item: QuoteItem) => {
        itemsMap[item.id] = (item.approved_price ?? item.requested_price ?? 0).toString();
      });
      setEditedItems(itemsMap);
      setMessages(messagesRes.data);
    } catch (error) {
      console.error('Error fetching quote detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (itemId: string | number, value: string) => {
    setEditedItems(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleSave = async (silent = false) => {
    setSaving(true);
    try {
      if (!quote) return;
      
      const itemsPayload = {
        items: quote.items.map(item => ({
          ...item,
          product_id: item.product_id || (item as any).product?.id,
          quantity: item.quantity || 1,
          approved_price: parseFloat(editedItems[item.id]) || 0
        }))
      };
      await api.put(`/admin/quotes/${quoteId}/items`, itemsPayload);

      const total = itemsPayload.items.reduce((sum, item) => sum + (item.approved_price * item.quantity), 0);
      
      await api.put(`/admin/quotes/${quoteId}`, {
        status,
        admin_notes: adminNotes,
        total_estimated_value: total
      });

      fetchQuoteDetail();
      if (!silent) {
        toast.success('Alterações salvas!');
      }
    } catch (error) {
      console.error('Error saving quote:', error);
      if (!silent) {
        toast.error('Erro ao salvar a cotação');
      }
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleSendQuote = async () => {
    try {
      if (!quote) return;
      setSaving(true);
      const newStatus = 'responded';
      
      const itemsPayload = {
        items: quote.items.map(item => ({
          ...item,
          product_id: item.product_id || (item as any).product?.id,
          quantity: item.quantity || 1,
          approved_price: parseFloat(editedItems[item.id]) || 0
        }))
      };
      await api.put(`/admin/quotes/${quoteId}/items`, itemsPayload);

      const total = itemsPayload.items.reduce((sum, item) => sum + (item.approved_price * item.quantity), 0);

      await api.put(`/admin/quotes/${quoteId}`, {
        status: newStatus,
        admin_notes: adminNotes,
        total_estimated_value: total
      });

      await api.post(`/admin/quotes/${quoteId}/messages`, { 
        message: "Enviámos a proposta revista com os preços atualizados. Por favor, verifique e baixe o PDF para pagamento se estiver de acordo." 
      });

      toast.success('Cotação enviada!');
      fetchQuoteDetail();
    } catch (error) {
      console.error('Error sending quote:', error);
      toast.error('Erro ao enviar cotação');
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      setSendingMsg(true);
      const res = await api.post(`/admin/quotes/${quoteId}/messages`, { message: newMessage });
      setMessages([...messages, res.data.message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSendingMsg(false);
    }
  }

  const handleInvoiceUpload = async () => {
    if (!selectedFile) return;
    setUploadingInvoice(true);
    try {
      const formData = new FormData();
      formData.append('invoice', selectedFile);
      await api.post(`/admin/quotes/${quoteId}/upload-invoice`, formData);
      toast.success('Factura anexada!');
      setSelectedFile(null);
      fetchQuoteDetail();
    } catch (error) {
      console.error('Error uploading invoice:', error);
      toast.error('Erro no upload');
    } finally {
      setUploadingInvoice(false);
    }
  };


  if (loading || !quote) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const liveTotal = quote.items.reduce((sum, item) => {
    const price = parseFloat(editedItems[item.id]) || 0;
    const qty = item.quantity || 1; // DEFENSIVE: Default to 1 to avoid NaN
    return sum + (price * qty);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Negociação #{quote?.quote_number}</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            Criada em {safeDateFormat(quote?.created_at, "dd 'de' MMMM 'de' yyyy")}
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary uppercase">
              {quote?.status}
            </Badge>
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={() => generateQuotePDF(quote, settings)} className="gap-2 border-gold text-gold hover:bg-gold hover:text-navy-dark font-bold">
            <FileDown className="w-4 h-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={onBack}>Cancelar</Button>
          <Button variant="secondary" onClick={() => handleSave()} disabled={saving} className="gap-2">
            Salvar Rascunho
          </Button>
          <Button onClick={handleSendQuote} disabled={saving} className="gap-2 bg-primary hover:bg-primary/90">
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Send className="w-4 h-4" />}
            Enviar Cotação ao Cliente
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Itens Solicitados
              </h3>
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Produto</th>
                    <th className="px-4 py-3 font-medium text-center">Quantidade</th>
                    <th className="px-4 py-3 font-medium text-right">Preço Unit. (MT)</th>
                    <th className="px-4 py-3 font-medium text-center">IVA</th>
                    <th className="px-4 py-3 font-medium text-right">Total c/ IVA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {quote.items.map((item) => {
                    const price = parseFloat(editedItems[item.id]) || 0;
                    const itemQuantity = item.quantity || 1; // FALLBACK: Default to 1
                    const subtotal = price * itemQuantity;
                    return (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="px-4 py-4">
                          <p className="font-medium">{item.product?.name || 'Produto não encontrado'}</p>
                          {item.requested_price && (
                            <p className="text-xs text-muted-foreground mt-1">Preço Sugerido: {item.requested_price} MT</p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center font-medium">
                          {itemQuantity} un
                        </td>
                        <td className="px-4 py-4 max-w-[150px]">
                          <Input 
                            type="number"
                            step="0.01"
                            min="0"
                            value={editedItems[item.id]}
                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                            className="text-right border-primary/50 focus-visible:ring-primary h-8 text-xs font-bold"
                          />
                        </td>
                        <td className="px-4 py-4 text-center text-xs text-muted-foreground">
                          16%
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-primary">
                          {(subtotal * 1.16).toLocaleString('pt-MZ')} MT
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-muted/10 border-t border-border">
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-right font-medium text-muted-foreground">Subtotal s/ IVA:</td>
                    <td className="px-4 py-4 text-right font-semibold">
                      {liveTotal.toLocaleString('pt-MZ')} MT
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-right font-medium text-muted-foreground">IVA (16%):</td>
                    <td className="px-4 py-4 text-right font-semibold">
                      {(liveTotal * 0.16).toLocaleString('pt-MZ')} MT
                    </td>
                  </tr>
                  <tr className="bg-primary/5">
                    <td colSpan={3} className="px-4 py-4 text-right font-black uppercase tracking-wider text-primary">Total Final (MT):</td>
                    <td className="px-4 py-4 text-right font-black text-xl text-primary">
                      {(liveTotal * 1.16).toLocaleString('pt-MZ')} MT
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-primary" />
              Detalhes do Cliente
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Nome de Contacto</p>
                <p className="font-medium">{quote.user?.name || 'Cliente Desconhecido'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Email de Contacto</p>
                <p>{quote.contact_email || quote.user?.email || 'N/A'}</p>
              </div>
              <div className="pt-3 border-t border-border mt-3">
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  Empresa B2B
                </p>
                <p className="font-medium">{quote.company_name || 'Individual'}</p>
                {quote.vat_number && <p className="text-xs mt-1 text-muted-foreground">NUIT: {quote.vat_number}</p>}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <h3 className="font-semibold mb-2">Painel de Negociação</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status da Cotação</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="pending">Pendente</option>
                <option value="responded">Respondida (Aguardando Cliente)</option>
                <option value="approved">Aprovada para Compra</option>
                <option value="payment_reported">Pagamento em Análise</option>
                <option value="completed">Concluída (Pagamento Confirmado)</option>
                <option value="rejected">Rejeitada</option>
                <option value="converted">Convertida em Pedido</option>
              </select>
            </div>

            <div className="space-y-3 flex flex-col pt-2 border-t border-border">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
                <MessageSquare className="w-4 h-4 text-primary" /> Histórico de Conversa
              </h4>
              <div className="flex-1 bg-muted/20 border border-border rounded-lg p-3 min-h-[160px] max-h-[250px] overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center flex items-center justify-center h-full opacity-60">
                    Nenhuma mensagem ainda.
                  </p>
                ) : messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.is_admin ? 'items-end' : 'items-start'}`}>
                    <div className={`p-2.5 rounded-xl text-sm max-w-[85%] ${msg.is_admin ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-background border border-border rounded-bl-none'}`}>
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      {msg.is_admin ? 'Você' : msg.user?.name || 'Cliente'} • {safeDateFormat(msg.created_at, "HH:mm, dd/MM")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <Textarea 
                  placeholder="Escreva uma mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[40px] h-[40px] py-2 resize-none text-sm"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                />
                <Button size="icon" disabled={!newMessage.trim() || sendingMsg} onClick={handleSendMessage} className="shrink-0 h-[40px] w-[40px] rounded-lg">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
