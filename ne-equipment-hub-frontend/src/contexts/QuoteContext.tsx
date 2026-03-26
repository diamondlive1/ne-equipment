import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useCart } from '../hooks/useCart';
import api from '@/services/api';
import { toast } from 'sonner';

interface QuoteContextType {
  isQuoteFormOpen: boolean;
  openQuoteForm: () => void;
  closeQuoteForm: () => void;
  toggleQuoteForm: () => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const QuoteProvider = ({ children }: { children: ReactNode }) => {
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  const openQuoteForm = async () => {
    if (isAuthenticated) {
      if (items.length === 0) {
        toast.error('O seu carrinho está vazio.');
        navigate('/');
        return;
      }

      try {
        // Obter os itens do carrinho para a cotação
        const quoteItems = items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }));

        // Enviar para o backend (Mock API ou Real)
        await api.post('/quotes', {
          items: quoteItems,
          // Os outros dados (empresa, email) são pegos do user logado no backend ou mockDb
        });

        toast.success('Cotação solicitada com sucesso!');
        clearCart();
        navigate('/dashboard');
      } catch (error) {
        console.error('Erro ao solicitar cotação:', error);
        toast.error('Erro ao processar a sua cotação. Tente novamente.');
      }
    } else {
      toast.info('Por favor, inicie sessão ou registe-se para solicitar uma cotação.');
      navigate('/register', { state: { from: { pathname: '/dashboard' } } });
    }
  };

  const closeQuoteForm = () => setIsQuoteFormOpen(false);
  const toggleQuoteForm = () => setIsQuoteFormOpen(prev => !prev);

  return (
    <QuoteContext.Provider value={{
      isQuoteFormOpen,
      openQuoteForm,
      closeQuoteForm,
      toggleQuoteForm
    }}>
      {children}
    </QuoteContext.Provider>
  );
};

export const useQuote = () => {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
};
