import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Inbox, ExternalLink, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { pt, enUS } from 'date-fns/locale';

interface NotificationData {
  type: string;
  title: string;
  message: string;
  quote_id?: number;
  order_id?: number;
  status?: string;
}

interface Notification {
  id: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
}

const Notifications = () => {
  const { isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    
    const { quote_id, order_id } = notification.data;
    if (quote_id || order_id) {
       navigate('/dashboard');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-gold/10 hover:text-gold"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-navy-dark tracking-tight">
              {t.notifications.title}
            </h1>
            <p className="text-muted-foreground text-sm">
              {notifications.filter(n => !n.read_at).length} {t.notifications.unread}
            </p>
          </div>
        </div>
        
        {notifications.some(n => !n.read_at) && (
          <Button 
            onClick={markAllAsRead}
            variant="outline"
            className="border-gold text-navy-dark hover:bg-gold hover:text-white transition-all gap-2"
          >
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">{t.notifications.markAllRead}</span>
          </Button>
        )}
      </div>

      <Card className="glass-card shadow-xl border-none overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
               <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
               <p className="mt-4 text-muted-foreground animate-pulse">Carregando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <Inbox className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <h3 className="text-xl font-bold text-navy-dark">{t.notifications.empty}</h3>
              <p className="text-muted-foreground mt-2 max-w-xs">
                {language === 'PT' 
                  ? 'Você não tem notificações no momento. Elas aparecerão aqui quando houver novidades sobre suas cotações ou pedidos.'
                  : 'You have no notifications at the moment. They will appear here when there is news about your quotes or orders.'}
              </p>
              <Button 
                onClick={() => navigate('/')} 
                className="mt-8 bg-gold hover:bg-navy-dark text-white font-bold"
              >
                {t.nav.home}
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-6 transition-all relative hover:bg-muted/30 cursor-pointer ${
                    !notification.read_at ? 'bg-gold/[0.03]' : ''
                  }`}
                >
                  {!notification.read_at && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gold shadow-[2px_0_10px_rgba(234,179,8,0.3)]"></div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                         <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20 font-bold text-[10px] uppercase tracking-widest px-2">
                           {notification.data.type.replace(/_/g, ' ')}
                         </Badge>
                         <span className="text-[11px] text-muted-foreground font-medium">
                           {format(new Date(notification.created_at), "d 'de' MMMM 'às' HH:mm", {
                             locale: language === 'PT' ? pt : enUS
                           })}
                         </span>
                      </div>
                      <h3 className="text-lg font-bold text-navy-dark mb-1">
                        {notification.data.title}
                      </h3>
                      <p className="text-navy-light/80 leading-relaxed max-w-2xl">
                        {notification.data.message}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      {!notification.read_at && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="h-8 text-[11px] font-bold text-gold hover:bg-gold/10"
                        >
                          {t.notifications.markAsRead}
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-gold"
                      >
                         <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-8 flex justify-center">
         <p className="text-xs text-muted-foreground italic">
            {language === 'PT' 
              ? 'As notificações são guardadas por 30 dias.' 
              : 'Notifications are kept for 30 days.'}
         </p>
      </div>
    </div>
  );
};

export default Notifications;
