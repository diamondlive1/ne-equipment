import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, ShoppingCart, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/services/api';

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

interface AdminOrderListProps {
  onViewOrder: (orderId: number) => void;
}

export default function AdminOrderList({ onViewOrder }: AdminOrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending_payment: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const statusLabels: Record<string, string> = {
    pending_payment: 'Aguardando Pagamento',
    paid: 'Pago',
    processing: 'Em Preparação',
    shipped: 'Em Transporte',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h2 className="text-2xl font-bold tracking-tight">Pedidos</h2>
          <p className="text-muted-foreground">
            Gerencie os pedidos realizados na plataforma B2B.
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Nº Pedido</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold">#{order.order_number}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{order.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(order.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      € {order.total_amount}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={statusColors[order.status]}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => onViewOrder(order.id)}
                      >
                        <Eye className="w-4 h-4" />
                        Ver / Atualizar
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
