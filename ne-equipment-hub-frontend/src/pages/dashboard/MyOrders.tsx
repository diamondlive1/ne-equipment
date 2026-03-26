import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const MyOrders = () => {
  const [search, setSearch] = useState('');

  const orders = [
    {
      id: '#PED-0847',
      date: '18 Fev 2026',
      items: 'MacBook Pro 14" M3 + 2 itens',
      value: '175.000 MT',
      status: 'in_transit',
      statusLabel: 'A caminho',
      eta: 'Chega a 28 de Fevereiro',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop'
    },
    {
      id: '#PED-0839',
      date: '10 Fev 2026',
      items: 'Monitor LG UltraWide 34"',
      value: '45.000 MT',
      status: 'delivered',
      statusLabel: 'Entregue a 12 de Fevereiro',
      eta: 'Sua encomenda foi entregue.',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&h=100&fit=crop'
    },
    {
      id: '#PED-0831',
      date: '02 Fev 2026',
      items: 'Conjunto EPI Completo Nível 3',
      value: '8.500 MT',
      status: 'pending_payment',
      statusLabel: 'Aguardando Pagamento',
      eta: 'Por favor, conclua o pagamento para envio.',
      image: 'https://images.unsplash.com/photo-1618090583220-3c2acd0ae3da?w=100&h=100&fit=crop'
    }
  ];

  const filtered = orders.filter(o => {
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.items.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-navy-dark">Meus Pedidos</h2>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Pesquisar todas as encomendas"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-gray-300 focus-visible:ring-black rounded-lg shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-6 flex flex-col">
        {filtered.length > 0 ? filtered.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Amazon-style Card Header */}
            <div className="bg-gray-50/80 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 text-sm">
              <div className="flex flex-wrap sm:flex-nowrap gap-6 sm:gap-12">
                <div>
                  <p className="text-gray-500 mb-1">PEDIDO EFETUADO</p>
                  <p className="text-gray-900">{order.date}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">TOTAL</p>
                  <p className="text-gray-900">{order.value}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-gray-500 mb-1">ENVIAR PARA</p>
                  <p className="text-navy hover:underline cursor-pointer">João da Silva</p>
                </div>
              </div>
              <div className="sm:text-right flex flex-col sm:items-end">
                <p className="text-gray-900 mb-1">PEDIDO {order.id}</p>
                <div className="flex items-center sm:justify-end gap-2 text-navy text-[13px]">
                  <button className="hover:underline">Ver Detalhes do Pedido</button>
                  <span className="text-gray-300">|</span>
                  <button className="hover:underline">Fatura</button>
                </div>
              </div>
            </div>

            {/* Amazon-style Card Body */}
            <div className="p-4 sm:p-6 bg-white flex flex-col sm:flex-row gap-6 sm:gap-8">
              <div className="w-24 h-24 flex-shrink-0 border border-gray-100 rounded-md p-2">
                <img src={order.image} className="w-full h-full object-contain" alt="Produto" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900">{order.statusLabel}</h4>
                <p className="text-gray-600 mt-1 mb-4">{order.eta}</p>

                <p className="text-gray-900 font-medium hover:text-navy hover:underline cursor-pointer inline-block mb-4">
                  {order.items}
                </p>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <button className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
                    Comprar Novamente
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
                    Rastrear Encomenda
                  </button>
                  {order.status === 'delivered' && (
                    <button className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
                      Escrever Avaliação
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-16 text-gray-500">
            Não encontramos nenhum pedido com esse termo.
          </div>
        )}
      </div>

    </div>
  );
};

export default MyOrders;
