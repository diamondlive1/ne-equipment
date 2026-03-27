import { useState, useEffect } from 'react';
import {
  ChevronRight,
  Home, Package, FileText, Truck, MapPin, User, LogOut, ShoppingCart
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import DashboardHome from './dashboard/DashboardHome';

import MyQuotes from './dashboard/MyQuotes';
import ProfileSettings from './dashboard/ProfileSettings';

interface CustomerDashboardProps {
  onBack: () => void;
  userName?: string; // Opcional: mantido para retrocompatibilidade
}

const CustomerDashboard = ({ onBack, userName: propUserName = 'Utilizador' }: CustomerDashboardProps) => {
  const [activeSection, setActiveSection] = useState('home');
  const { items: cartItems } = useCart();
  const { user, logout } = useAuth();

  const userName = user?.name || propUserName;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(user?.name ? `Até logo, ${user.name}!` : 'Sessão terminada com sucesso.');
      onBack(); // Redireciona para o início
    } catch (error) {
      toast.error('Erro ao terminar sessão.');
    }
  };

  const navItems = [
    { id: 'home', label: 'Visão Geral', icon: Home },
    { id: 'quotes', label: 'Painel de Negociação', icon: FileText },
    { id: 'profile', label: 'Definições de Conta', icon: User },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'home': return <DashboardHome onNavigate={setActiveSection} />;
      case 'quotes': return <MyQuotes />;
      case 'profile': return <ProfileSettings />;
      default: return <DashboardHome onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-20 md:pt-28 pb-16 font-sans antialiased">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* Breadcrumb profissional */}
        <nav className="mb-8 lg:mb-10">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <button
                onClick={onBack}
                className="hover:text-blue-700 transition-colors"
              >
                Início
              </button>
            </li>
            <li><ChevronRight className="w-4 h-4 text-gray-400" /></li>
            <li className="font-medium text-gray-900">A Minha Conta</li>
          </ol>
          <h1 className="mt-3 text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
            A Minha Conta
          </h1>
          <p className="mt-1 text-base text-gray-600">
            Olá, {userName}. Gerencie seus pedidos, cotações e perfil aqui.
          </p>
        </nav>

        <div className="flex flex-col lg:flex-row lg:gap-12">

          {/* Sidebar corporativa */}
          <aside className="lg:w-72 flex-shrink-0">
            <nav className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">Conta verificada</p>
                  </div>
                </div>
              </div>

              <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible divide-x lg:divide-x-0 lg:divide-y divide-gray-100">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-3 py-3 px-5 text-sm font-medium transition-colors whitespace-nowrap lg:whitespace-normal ${activeSection === item.id
                      ? 'text-blue-700 bg-blue-50/70 border-l-4 border-blue-700 lg:border-l-4 lg:border-blue-700 lg:bg-blue-50/70'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                      }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full py-2 px-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sair da conta
                </button>
              </div>
            </nav>

            {/* Cart summary discreto (B2B style: compacto, sem overload de imagens) */}
            {cartItems.length > 0 && (
              <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5 hidden lg:block">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-700" />
                    <h3 className="font-semibold text-gray-900 text-sm">Carrinho ({cartItems.length})</h3>
                  </div>
                  <span className="text-xs text-gray-500">Ver detalhes</span>
                </div>
                <button
                  onClick={onBack}
                  className="w-full py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Continuar para o Carrinho
                </button>
              </div>
            )}
          </aside>

          {/* Área de conteúdo principal */}
          <main className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8 min-w-0">
            {renderContent()}
          </main>

        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;