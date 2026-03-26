import { useState, useEffect } from 'react';
import { ChevronLeft, Save, MapPin, Package, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/services/api';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price_at_time: number;
  product: {
    name: string;
    description: string;
  };
}

interface OrderDetail {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  shipping_fee: number;
  created_at: string;
  user: {
    name: string;
    email: string;
    company?: {
      name: string;
      vat_number: string;
    };
  };
  deliveryAddress?: {
    street: string;
    city: string;
    zip_code: string;
    country: string;
  };
  items: OrderItem[];
}

interface AdminOrderDetailProps {
  orderId: number;
  onBack: () => void;
}

export default function AdminOrderDetail({ orderId, onBack }: AdminOrderDetailProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const response = await api.get(`/admin/orders/${orderId}`);
      setOrder(response.data);
      setStatus(response.data.status);
    } catch (error) {
      console.error('Error fetching order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/orders/${orderId}`, { status });
      fetchOrderDetail();
      alert('Status do pedido atualizado com sucesso!');
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Erro ao atualizar o pedido.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const subtotal = order.total_amount - (order.shipping_fee || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pedido #{order.order_number}</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            Realizado em {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary uppercase">
              {order.status}
            </Badge>
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={onBack}>Voltar</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
            Salvar Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Principal: Itens do Pedido */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Itens Comprados
              </h3>
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Produto</th>
                    <th className="px-4 py-3 font-medium text-center">Formato/Preço un.</th>
                    <th className="px-4 py-3 font-medium text-center">Qtd</th>
                    <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item) => {
                    const lineTotal = item.price_at_time * item.quantity;
                    return (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="px-4 py-4 font-medium">
                          {item.product.name}
                        </td>
                        <td className="px-4 py-4 text-center">
                          € {parseFloat(item.price_at_time.toString()).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-center font-medium">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 text-right font-semibold">
                          € {lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-muted/10 border-t border-border">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right text-muted-foreground">Subtotal:</td>
                    <td className="px-4 py-3 text-right font-medium">€ {subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right text-muted-foreground border-b border-border">Custo de Envio (Logística):</td>
                    <td className="px-4 py-3 text-right font-medium border-b border-border text-orange-500">+ € {order.shipping_fee}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-right font-bold text-lg">Total Pago:</td>
                    <td className="px-4 py-4 text-right font-bold text-lg text-primary">
                      € {order.total_amount}
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
              Informação do Cliente
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Nome</p>
                <p className="font-medium">{order.user.name}</p>
                <p className="text-muted-foreground mt-0.5">{order.user.email}</p>
              </div>
              
              {order.user.company && (
                <div className="pt-3 border-t border-border mt-3">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold flex items-center gap-1 mb-1">
                    <Building className="w-3 h-3" />
                    Empresa
                  </p>
                  <p className="font-medium">{order.user.company.name}</p>
                  <p className="text-muted-foreground text-xs">NIF: {order.user.company.vat_number}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-primary" />
              Morada de Entrega
            </h3>
            {order.deliveryAddress ? (
              <address className="text-sm not-italic space-y-1">
                <p className="font-medium">{order.deliveryAddress.street}</p>
                <p>{order.deliveryAddress.zip_code} {order.deliveryAddress.city}</p>
                <p>{order.deliveryAddress.country}</p>
              </address>
            ) : (
              <p className="text-sm text-muted-foreground italic">Não especificada ou levantamento local.</p>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <h3 className="font-semibold mb-2">Atualizar Estado do Pedido</h3>
            
            <div className="space-y-2">
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="pending_payment">Aguardando Pagamento</option>
                <option value="paid">Pago</option>
                <option value="processing">Em Processamento</option>
                <option value="shipped">Enviado (Em Transporte)</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
