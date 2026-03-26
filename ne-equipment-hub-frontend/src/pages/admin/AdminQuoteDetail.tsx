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
  FileDown
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
  id: number;
  product_id: number;
  quantity: number;
  requested_price: number | null;
  approved_price: number | null;
  product: {
    name: string;
    description: string;
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

  const [editedItems, setEditedItems] = useState<Record<number, string>>({});
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

      const itemsMap: Record<number, string> = {};
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

  const handlePriceChange = (itemId: number, value: string) => {
    setEditedItems(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Atualizar Itens
      const itemsPayload = {
        items: Object.entries(editedItems).map(([id, price]) => ({
          id: parseInt(id),
          approved_price: parseFloat(price)
        }))
      };
      await api.put(`/admin/quotes/${quoteId}/items`, itemsPayload);

      // 2. Atualizar Quote Geral
      await api.put(`/admin/quotes/${quoteId}`, {
        status,
        admin_notes: adminNotes
      });

      // Recarregar dados
      fetchQuoteDetail();
      toast.success('Cotação atualizada!', { description: status === 'converted' ? 'Pedido gerado com sucesso.' : 'Informação enviada ao cliente.' });
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Erro ao salvar a cotação', { description: 'Verifique os dados e tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendToClient = async () => {
    setSaving(true);
    try {
      // 1. Atualizar Itens
      const itemsPayload = {
        items: Object.entries(editedItems).map(([id, price]) => ({
          id: parseInt(id),
          approved_price: parseFloat(price)
        }))
      };
      await api.put(`/admin/quotes/${quoteId}/items`, itemsPayload);

      // 2. Atualizar Status para 'responded'
      await api.put(`/admin/quotes/${quoteId}`, {
        status: 'responded',
        admin_notes: adminNotes
      });

      // 3. Enviar mensagem automática
      await api.post(`/admin/quotes/${quoteId}/messages`, { 
        message: "Cotação enviada com sucesso! Verifique os novos preços no painel e já pode baixar o PDF da negociação para processar o pagamento." 
      });

      // Recarregar dados
      fetchQuoteDetail();
      toast.success('Cotação enviada ao cliente com sucesso!');
    } catch (error) {
      console.error('Error sending quote:', error);
      toast.error('Erro ao enviar a cotação');
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

      const response = await api.post(`/admin/quotes/${quoteId}/upload-invoice`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Factura anexada com sucesso!');
      setSelectedFile(null);
      fetchQuoteDetail();
    } catch (error) {
      console.error('Error uploading invoice:', error);
      toast.error('Erro ao fazer upload da factura');
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
    return sum + (price * item.quantity);
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
          <Button 
            onClick={handleSendToClient} 
            disabled={saving} 
            className="gap-2 bg-whatsapp hover:bg-whatsapp-dark text-white font-bold"
          >
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Send className="w-4 h-4" />}
            Enviar Cotação ao Cliente
          </Button>
          <Button variant="outline" onClick={() => generateQuotePDF(quote, settings)} className="gap-2 border-gold text-gold hover:bg-gold hover:text-navy-dark font-bold">
            <FileDown className="w-4 h-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={onBack}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 border-primary text-primary hover:bg-primary/10 bg-transparent">
            <Save className="w-4 h-4" />
            Apenas Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Principal: Itens da Cotação */}
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
                    <th className="px-4 py-3 font-medium text-right">Preço Aprovado (MT)</th>
                    <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {quote.items.map((item) => {
                    const price = parseFloat(editedItems[item.id]) || 0;
                    const subtotal = price * item.quantity;
                    return (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="px-4 py-4">
                          <p className="font-medium">{item.product?.name || 'Produto não encontrado'}</p>
                          {item.requested_price && (
                            <p className="text-xs text-muted-foreground mt-1">Preço Sugerido: €{item.requested_price}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center font-medium">
                          {item.quantity} un
                        </td>
                        <td className="px-4 py-4 max-w-[150px]">
                          <Input 
                            type="number"
                            step="0.01"
                            min="0"
                            value={editedItems[item.id]}
                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                            className="text-right border-primary/50 focus-visible:ring-primary"
                          />
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-primary">
                          {subtotal.toLocaleString('pt-MZ')} MT
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-muted/10 border-t border-border">
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-right font-medium">Valor Total Estimado:</td>
                    <td className="px-4 py-4 text-right font-bold text-lg text-primary">
                      {liveTotal.toLocaleString('pt-MZ')} MT
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Coluna Secundária: Cliente e Ações */}
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

            {quote.status === 'payment_reported' && (
              <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <p className="font-bold text-sm">O cliente reportou o pagamento!</p>
                </div>
                <p className="text-xs">Verifique o comprovativo (anexado no chat ou fatura) e confirme a conclusão da negociação para gerar o pedido automaticamente.</p>
                <Button 
                  onClick={() => {
                    setStatus('completed');
                    toast.info('Clique em "Salvar Alterações" no topo para confirmar.');
                  }} 
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
                  Marcar como Concluída
                </Button>
              </div>
            )}

            <div className="space-y-3 flex flex-col pt-2 border-t border-border">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
                <MessageSquare className="w-4 h-4 text-primary" /> Histórico de Conversa
              </h4>
              
              <div className="flex-1 bg-muted/20 border border-border rounded-lg p-3 min-h-[160px] max-h-[250px] overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center flex items-center justify-center h-full opacity-60">
                    Nenhuma mensagem ainda. Envie a primeira mensagem!
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
                  placeholder="Escreva uma mensagem para o cliente..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[40px] h-[40px] py-2 resize-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  size="icon" 
                  disabled={!newMessage.trim() || sendingMsg} 
                  onClick={handleSendMessage}
                  className="shrink-0 h-[40px] w-[40px] rounded-lg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Upload de Factura */}
            <div className="space-y-3 flex flex-col pt-4 border-t border-border mt-2">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
                <Upload className="w-4 h-4 text-primary" /> Factura / Recibo
              </h4>
              
              {quote.invoice_path ? (
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Factura Anexada</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="h-8 text-green-700 hover:text-green-800 hover:bg-green-100">
                    <a 
                      href={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${quote.invoice_path}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      Ver
                    </a>
                  </Button>
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground italic">
                  Anexe a factura para que o cliente possa efetuar o pagamento.
                </p>
              )}

              <div className="flex flex-col gap-2">
                <Input 
                  type="file" 
                  accept=".pdf,image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="text-xs h-9 py-1 px-2"
                />
                <Button 
                  size="sm" 
                  disabled={!selectedFile || uploadingInvoice}
                  onClick={handleInvoiceUpload}
                  className="w-full gap-2 text-xs h-9"
                >
                  {uploadingInvoice ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  {quote.invoice_path ? 'Substituir Factura' : 'Enviar Factura'}
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
