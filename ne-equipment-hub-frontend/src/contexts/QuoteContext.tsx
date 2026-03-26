import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

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
  const { isAuthenticated } = useAuth();

  const openQuoteForm = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
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
