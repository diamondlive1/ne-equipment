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
  const navigate = useNavigate();
  const { openQuoteForm } = useQuote();
  const { isAuthenticated, user } = useAuth();

  // Map paths to PageType
  const getPageFromPath = (path: string): PageType => {
    if (path === '/dashboard') return 'dashboard';
    if (path === '/catalog') return 'b2b';
    if (path === '/about') return 'about';
    if (path === '/services') return 'services';
    if (path === '/contact') return 'contact';
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState<PageType>(getPageFromPath(location.pathname));

  useEffect(() => {
    const page = getPageFromPath(location.pathname);
    
    // Auth protection for dashboard
    if (page === 'dashboard') {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: { pathname: '/dashboard' } } });
        return;
      } else if (user?.role === 'admin') {
        navigate('/admin');
        return;
      }
    }

    setCurrentPage(page);
  }, [location.pathname, isAuthenticated, user, navigate]);

  const handleNavigate = (page: PageType) => {
    let path = '/';
    if (page === 'dashboard') path = '/dashboard';
    else if (page === 'b2b') path = '/catalog';
    else if (page === 'about') path = '/about';
    else if (page === 'services') path = '/services';
    else if (page === 'contact') path = '/contact';

    // Only navigate if path changes
    if (location.pathname !== path) {
      navigate(path);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="min-h-screen bg-background">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onQuoteClick={openQuoteForm}
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
            <ServicesSection />
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
    </div>
  );
};

export default Index;
