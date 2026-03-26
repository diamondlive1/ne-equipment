import { ArrowRight, Gavel, Package, TrendingDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardHomeProps {
  onNavigate: (section: string) => void;
}

const DashboardHome = ({ onNavigate }: DashboardHomeProps) => {
  const { user } = useAuth();
  const userName = user?.name || 'Cliente';

  const recentOrders = [
    {
      id: '#PED-0847',
      date: '18 Fev 2026',
      total: '175.000 MT',
      status: 'Em Trânsito',
      statusColor: 'text-blue-600 bg-blue-50',
    },
    {
      id: '#PED-0839',
      date: '10 Fev 2026',
      total: '45.000 MT',
      status: 'Entregue',
      statusColor: 'text-green-600 bg-green-50',
    },
    {
      id: '#PED-0831',
      date: '02 Fev 2026',
      total: '8.500 MT',
      status: 'Aguardando Pagamento',
      statusColor: 'text-orange-600 bg-orange-50',
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold text-navy-dark mb-4">Bem-vindo, {userName}.</h2>
        <p className="text-gray-600 text-[15px] leading-relaxed">
          Este é o seu centro de operações. Aqui pode gerir os seus{' '}
          <button onClick={() => onNavigate('orders')} className="text-navy hover:underline font-bold">pedidos activos</button>, 
          acompanhar as suas <button onClick={() => onNavigate('quotes')} className="text-navy hover:underline font-bold">negociações de preço</button> e 
          ajustar as suas <button onClick={() => onNavigate('profile')} className="text-navy hover:underline font-bold">configurações de conta</button>.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-navy-dark">Pedidos Recentes</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 font-medium">
                <th className="pb-3 pr-6 font-medium">Pedido</th>
                <th className="pb-3 pr-6 font-medium">Data</th>
                <th className="pb-3 pr-6 font-medium">Estado</th>
                <th className="pb-3 pr-6 font-medium">Total</th>
                <th className="pb-3 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 pr-6 font-medium text-navy-dark">{order.id}</td>
                  <td className="py-4 pr-6 text-gray-600">{order.date}</td>
                  <td className="py-4 pr-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 pr-6 text-gray-600">{order.total}</td>
                  <td className="py-4 text-right">
                    <button className="text-navy font-medium hover:underline text-sm inline-flex items-center gap-1 group-hover:text-gold-dark transition-colors">
                      Ver pedido <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
