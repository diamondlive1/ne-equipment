import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  FileText,
  Truck,
  Store,
  Users,
  FileEdit,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import AdminDashboard from './AdminDashboard';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import AdminQuoteList from './AdminQuoteList';
import AdminQuoteDetail from './AdminQuoteDetail';
import CategoryManagement from './CategoryManagement';
import AdminSettings from './AdminSettings';
import api from '@/services/api';

type AdminSection =
  | 'overview'
  | 'products'
  | 'categories'
  | 'rfqs'
  | 'tracking'
  | 'marketplace'
  | 'users'
  | 'cms'
  | 'settings';

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Dashboard Geral', icon: LayoutDashboard },
  { id: 'products', label: 'Produtos', icon: Package, badge: '248' },
  { id: 'categories', label: 'Categorias', icon: FolderTree },
  { id: 'rfqs', label: 'RFQs', icon: FileText, badge: '5' },
  { id: 'tracking', label: 'Tracking / Logística', icon: Truck },
  { id: 'marketplace', label: 'Marketplace', icon: Store },
  { id: 'users', label: 'Utilizadores & RBAC', icon: Users },
  { id: 'cms', label: 'CMS Institucional', icon: FileEdit },
  { id: 'settings', label: 'Definições', icon: Settings },
];

const AdminLayout = () => {
  const [section, setSection] = useState<AdminSection>('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingQuoteId, setViewingQuoteId] = useState<number | null>(null);
  const [viewingOrderId, setViewingOrderId] = useState<number | null>(null);
  const [counts, setCounts] = useState<{ [key: string]: number }>({
    products: 0,
    rfqs: 5
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { logout } = useAuth();
  const apiInstance = api; // Reference to the imported api service

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/products');
        if (Array.isArray(response.data)) {
          setCounts(prev => ({ ...prev, products: response.data.length }));
        }
      } catch (error) {
        console.error('Error fetching product stats:', error);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unread_count);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchStats();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [section === 'products' && !isAddingProduct && !editingProduct]); // Refresh when coming back to product list

  const renderContent = () => {
    switch (section) {
      case 'overview':
        return <AdminDashboard />;
      case 'products':
        if (isAddingProduct || editingProduct) {
          return (
            <ProductForm
              product={editingProduct}
              onSuccess={() => {
                setIsAddingProduct(false);
                setEditingProduct(null);
              }}
              onCancel={() => {
                setIsAddingProduct(false);
                setEditingProduct(null);
              }}
            />
          );
        }
        return (
          <ProductList
            onAddProduct={() => setIsAddingProduct(true)}
            onEditProduct={(product) => setEditingProduct(product)}
          />
        );
      case 'rfqs':
        if (viewingQuoteId) {
          return (
            <AdminQuoteDetail
              quoteId={viewingQuoteId}
              onBack={() => setViewingQuoteId(null)}
            />
          );
        }
        return <AdminQuoteList onViewQuote={(id) => setViewingQuoteId(id)} />;
      case 'categories':
        return <CategoryManagement />;
      case 'settings':
        return <AdminSettings />;
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                {(() => {
                  const item = navItems.find((n) => n.id === section);
                  if (item) {
                    const Icon = item.icon;
                    return <Icon className="w-8 h-8 text-muted-foreground" />;
                  }
                  return null;
                })()}
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {navItems.find((n) => n.id === section)?.label}
              </h2>
              <p className="text-muted-foreground text-sm">
                Módulo em desenvolvimento — será implementado na próxima fase.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'sticky top-0 h-screen flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 z-30',
          collapsed ? 'w-[68px]' : 'w-[260px]'
        )}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-black text-xs">
            NE
          </div>
          {!collapsed && (
            <span className="font-bold text-sm tracking-wide whitespace-nowrap">
              ADMIN PANEL
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const active = section === item.id;
            const badge = item.id === 'products' ? counts.products.toString() : item.badge;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setSection(item.id);
                  setIsAddingProduct(false);
                  setEditingProduct(null);
                  setViewingQuoteId(null);
                  setViewingOrderId(null);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  active ? "text-sidebar-primary" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
                )} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {badge && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-[10px] px-1.5 py-0 h-5 font-bold min-w-[20px] justify-center border-none',
                          active
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                            : 'bg-sidebar-border text-sidebar-foreground/50'
                        )}
                      >
                        {badge}
                      </Badge>
                    )}
                  </>
                )}
                {collapsed && badge && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-sidebar-primary rounded-full border-2 border-sidebar" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-sidebar-border p-2 shrink-0 space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 transition-all"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 shrink-0" />
                <span>Recolher</span>
              </>
            )}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Sair / Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-foreground hidden sm:block">
              {navItems.find((n) => n.id === section)?.label}
            </h1>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                className="pl-9 h-9 w-48 lg:w-64 bg-muted/50 border-border/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </Button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setNotificationsOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-2xl border border-border z-20 overflow-hidden"
                    >
                      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                        <h3 className="font-bold text-sm">Notificações</h3>
                        {unreadCount > 0 && (
                          <button 
                            className="text-[10px] text-primary font-bold hover:underline"
                            onClick={async () => {
                              await api.post('/notifications/read-all');
                              setUnreadCount(0);
                              setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date() })));
                            }}
                          >
                            Marcar todas como lidas
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto divide-y divide-border/50">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground text-sm">
                            Nenhuma notificação encontrada.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={cn(
                                "p-4 hover:bg-muted/30 transition-colors cursor-pointer relative",
                                !n.read_at && "bg-primary/5"
                              )}
                              onClick={async () => {
                                if (!n.read_at) {
                                  await api.post(`/notifications/${n.id}/read`);
                                  setUnreadCount(prev => Math.max(0, prev - 1));
                                  setNotifications(prev => prev.map(notif => 
                                    notif.id === n.id ? { ...notif, read_at: new Date() } : notif
                                  ));
                                }
                                if (n.data.type === 'new_quote') {
                                  setSection('rfqs');
                                  setViewingQuoteId(n.data.quote_id);
                                  setNotificationsOpen(false);
                                }
                              }}
                            >
                              {!n.read_at && (
                                <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full" />
                              )}
                              <p className="text-xs font-bold text-foreground mb-1">{n.data.title}</p>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{n.data.message}</p>
                              <p className="text-[9px] text-muted-foreground/60 mt-2">
                                {new Date(n.created_at).toLocaleString('pt-MZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                AD
              </div>
              <span className="text-sm font-medium text-foreground hidden md:block">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
