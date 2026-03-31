import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, ExternalLink, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
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

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    
    setIsOpen(false);
    
    const { quote_id, order_id } = notification.data;
    if (quote_id) {
       // Deep link to quotes (dashboard already handles this if we go there)
       navigate('/dashboard');
    } else if (order_id) {
       navigate('/dashboard');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-navy-dark hover:text-gold transition-colors focus:outline-none">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white p-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 glass-card" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-bold text-navy-dark flex items-center gap-2">
            <Bell className="w-4 h-4 text-gold" />
            {t.notifications.title}
          </h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-[10px] h-7 px-2 hover:bg-gold/10 hover:text-gold transition-colors"
            >
              <Check className="w-3 h-3 mr-1" />
              {t.notifications.markAllRead}
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Inbox className="w-12 h-12 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">{t.notifications.empty}</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-border/30 cursor-pointer transition-colors hover:bg-muted/50 relative ${
                    !notification.read_at ? 'bg-gold/5' : ''
                  }`}
                >
                  {!notification.read_at && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold"></div>
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[11px] font-bold text-gold uppercase tracking-wider">
                      {notification.data.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: language === 'PT' ? pt : enUS
                      })}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-navy-dark mb-1 leading-tight">
                    {notification.data.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {notification.data.message}
                  </p>
                  
                  <div className="mt-3 flex justify-end">
                     <button className="text-[10px] font-bold text-navy-dark/60 hover:text-gold flex items-center gap-1 transition-colors">
                        {t.dashboard.home.viewDetails}
                        <ExternalLink className="w-2.5 h-2.5" />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-3 border-t border-border/50 text-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs font-bold border-gold text-navy-dark hover:bg-gold hover:text-white transition-all"
            onClick={() => {
              navigate('/notifications');
              setIsOpen(false);
            }}
          >
            {t.notifications.viewAll}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
