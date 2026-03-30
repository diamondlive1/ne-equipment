import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, FileText, Menu, X, Trash2, Plus, Minus, Phone, Mail, LayoutDashboard, LogIn, UserCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/i18n/LanguageContext';
import logoNE from '@/assets/logo-ne-equipment.png';

type PageType = 'home' | 'about' | 'b2b' | 'contact' | 'dashboard';

interface HeaderProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onQuoteClick: () => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'decimal',
    minimumFractionDigits: 2,
  }).format(price) + ' MT';
};

const Header = ({ currentPage, onNavigate, onQuoteClick }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { items, removeItem, updateQuantity, getItemCount, clearCart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: { label: string; page: PageType }[] = [
    { label: t.nav.home, page: 'home' },
    { label: t.nav.about, page: 'about' },
    { label: t.nav.b2b, page: 'b2b' },
    { label: t.nav.contact, page: 'contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top bar */}
      <div className="bg-navy-dark py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <p className="text-xs md:text-sm text-white/70 italic font-light hidden md:block">
            {t.header.quote}
          </p>
          <div className="flex items-center gap-4 md:gap-6 text-xs text-white/70 ml-auto">
            <a href="tel:+258843114354" className="flex items-center gap-1 hover:text-gold transition-colors">
              <Phone className="w-3 h-3" />
              <span className="hidden sm:inline">+258 84 311 4354</span>
            </a>
            <a href="mailto:sales@neequipment.co.mz" className="flex items-center gap-1 hover:text-gold transition-colors">
              <Mail className="w-3 h-3" />
              <span className="hidden sm:inline">sales@neequipment.co.mz</span>
            </a>

            {/* Language Toggle */}
            <div className="flex items-center gap-1 border-l border-white/20 pl-4">
              <button
                onClick={() => setLanguage('PT')}
                className={`text-xs font-medium transition-colors ${language === 'PT' ? 'text-gold' : 'text-white/60 hover:text-white'}`}
              >
                PT
              </button>
              <span className="text-white/40">/</span>
              <button
                onClick={() => setLanguage('EN')}
                className={`text-xs font-medium transition-colors ${language === 'EN' ? 'text-gold' : 'text-white/60 hover:text-white'}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-3">
              <img src={logoNE} alt="NE Equipment" className="h-12 md:h-14 w-auto" />
            </button>

            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${currentPage === item.page ? 'text-gold' : 'text-navy-dark hover:text-gold'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">




              {/* User Account / Auth Button */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-4">
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`flex items-center gap-2 text-sm font-semibold tracking-wide transition-colors duration-200 ${currentPage === 'dashboard' ? 'text-gold' : 'text-navy-dark hover:text-gold'}`}
                  >
                    <UserCircle className="w-5 h-5" />
                    <span>{user?.name || (language === 'PT' ? 'A Minha Conta' : 'My Account')}</span>
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 text-[11px] font-bold text-destructive hover:text-destructive-foreground hover:bg-destructive/10 px-2 py-1 rounded transition-all uppercase tracking-tighter"
                    title="Terminar Sessão"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sair</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login', { state: { from: location } })}
                  className="hidden md:flex items-center gap-2 text-sm font-semibold tracking-wide text-navy-dark hover:text-gold transition-colors duration-200"
                >
                  <LogIn className="w-5 h-5" />
                  <span>{language === 'PT' ? 'Entrar' : 'Login'}</span>
                </button>
              )}

              <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetTrigger asChild>
                  <button className="relative p-2 text-navy-dark hover:text-gold transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                    {getItemCount() > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-navy-dark text-xs font-bold rounded-full flex items-center justify-center">
                        {getItemCount()}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md glass-card">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-navy-dark">
                      <ShoppingCart className="w-5 h-5" />
                      {t.header.cart} ({getItemCount()})
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground">
                      {language === 'PT' ? 'Gerencie os itens da sua solicitação de cotação.' : 'Manage the items in your quote request.'}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 mb-2">
                    {isAuthenticated ? (
                      <Button
                        onClick={() => { onNavigate('dashboard'); setCartOpen(false); }}
                        variant="outline"
                        className="w-full border-primary text-primary font-bold gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {language === 'PT' ? 'MEU PAINEL' : 'MY PANEL'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => { navigate('/login'); setCartOpen(false); }}
                        variant="outline"
                        className="w-full border-primary text-primary font-bold gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        {language === 'PT' ? 'ENTRAR NA CONTA' : 'SIGN IN'}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4 mt-6">
                    {items.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">{t.header.noQuoteItems}</p>
                    ) : (
                      <>
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.specifications}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{item.quantity} {t.header.units}</span>
                              <button onClick={() => removeItem(item.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="border-t pt-4">
                          {user?.role !== 'admin' ? (
                            <Button 
                              onClick={() => {
                                onQuoteClick();
                                setCartOpen(false);
                              }} 
                              className="w-full bg-primary hover:bg-navy-light font-bold text-white"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              {isAuthenticated ? t.header.submitQuote : t.header.requestQuote}
                            </Button>
                          ) : (
                            <p className="text-xs text-muted-foreground text-center italic py-2">
                              {language === 'PT' ? 'Admins não podem solicitar cotações.' : 'Admins cannot request quotes.'}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="w-full mt-4 text-sm text-muted-foreground hover:text-destructive transition-colors"
                    >
                      {t.header.clearCart}
                    </button>
                  )}
                </SheetContent>
              </Sheet>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-navy-dark"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-border/50"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => { onNavigate(item.page); setMobileMenuOpen(false); }}
                  className={`text-left py-3 px-4 rounded-xl text-sm font-semibold transition-colors ${currentPage === item.page ? 'text-gold bg-gold/10' : 'text-navy-dark hover:text-gold hover:bg-gold/5'
                    }`}
                >
                  {item.label}
                </button>
              ))}

              {isAuthenticated && (
                <button
                  onClick={async () => {
                    await logout();
                    setMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="text-left py-3 px-4 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {language === 'PT' ? 'Sair da conta' : 'Logout'}
                </button>
              )}

              {!isAuthenticated && (
                <button
                  onClick={() => { navigate('/login', { state: { from: location } }); setMobileMenuOpen(false); }}
                  className="text-left py-3 px-4 rounded-xl text-sm font-semibold text-navy-dark hover:bg-gold/5 transition-colors flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-gold" />
                  {language === 'PT' ? 'Entrar' : 'Login'}
                </button>
              )}

            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
