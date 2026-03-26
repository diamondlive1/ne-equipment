import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuote } from '@/contexts/QuoteContext';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import CatalogSection from '@/components/CatalogSection';
import BrandsCarousel from '@/components/BrandsCarousel';
import ServicesSection from '@/components/ServicesSection';
import PaymentMethods from '@/components/PaymentMethods';
import QuoteForm from '@/components/QuoteForm';
import TransportForm from '@/components/TransportForm';
import WhatsAppButton from '@/components/WhatsAppButton';
import Footer from '@/components/Footer';

// Full Page Components
import B2BCatalog from '@/pages/B2BCatalog';
import Services from '@/pages/Services';
import Contact from '@/pages/Contact';
import CustomerDashboard from '@/pages/CustomerDashboard';

type PageType = 'home' | 'about' | 'b2b' | 'services' | 'contact' | 'dashboard';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const Index = () => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    return location.pathname === '/dashboard' ? 'dashboard' : 'home';
  });
  const [transportFormOpen, setTransportFormOpen] = useState(false);
  const { openQuoteForm } = useQuote();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/dashboard') {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: { pathname: '/dashboard' } } });
      } else if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        setCurrentPage('dashboard');
      }
    } else if (location.pathname === '/') {
      setCurrentPage('home');
    }
  }, [location.pathname, isAuthenticated, user, navigate]);

  const handleNavigate = (page: PageType) => {
    if (page === 'dashboard') {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: { pathname: '/dashboard' } } });
        return;
      }

      if (user?.role === 'admin') {
        navigate('/admin');
        return;
      }
      if (location.pathname !== '/dashboard') navigate('/dashboard');
    } else {
      if (location.pathname !== '/') navigate('/');
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onQuoteClick={openQuoteForm}
        onTransportClick={() => setTransportFormOpen(true)}
      />

      <AnimatePresence mode="wait">
        {currentPage === 'home' && (
          <motion.main
            key="home"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <HeroSection onQuoteClick={openQuoteForm} />
            <AboutSection />
            <CatalogSection onNavigateB2B={() => handleNavigate('b2b')} />
            <BrandsCarousel />
            <ServicesSection onTransportClick={() => setTransportFormOpen(true)} />
            <PaymentMethods />
          </motion.main>
        )}

        {currentPage === 'about' && (
          <motion.main
            key="about"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="pt-32"
          >
            <AboutSection />
          </motion.main>
        )}

        {currentPage === 'b2b' && (
          <motion.main key="b2b" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <B2BCatalog />
          </motion.main>
        )}

        {currentPage === 'services' && (
          <motion.main key="services" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <Services />
          </motion.main>
        )}

        {currentPage === 'contact' && (
          <motion.main key="contact" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <Contact />
          </motion.main>
        )}

        {currentPage === 'dashboard' && (
          <motion.main key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <CustomerDashboard onBack={() => handleNavigate('home')} />
          </motion.main>
        )}
      </AnimatePresence>

      <Footer />
      <WhatsAppButton />
      <TransportForm isOpen={transportFormOpen} onClose={() => setTransportFormOpen(false)} />
    </div>
  );
};

export default Index;
