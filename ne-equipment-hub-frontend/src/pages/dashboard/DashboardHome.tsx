import { ArrowRight, Gavel, Package, TrendingDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardHomeProps {
  onNavigate: (section: string) => void;
}

const DashboardHome = ({ onNavigate }: DashboardHomeProps) => {
  const { user } = useAuth();
  const userName = user?.name || 'Cliente';



  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold text-navy-dark mb-4">Bem-vindo, {userName}.</h2>
        <p className="text-gray-600 text-[15px] leading-relaxed">
          acompanhar as suas <button onClick={() => onNavigate('quotes')} className="text-navy hover:underline font-bold">negociações de preço</button> e 
          ajustar as suas <button onClick={() => onNavigate('profile')} className="text-navy hover:underline font-bold">configurações de conta</button>.
        </p>
      </div>


    </div>
  );
};

export default DashboardHome;
