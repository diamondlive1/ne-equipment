import axios, { InternalAxiosRequestConfig } from 'axios';
import { getDb, saveDb, generateId } from './mockDb';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Custom adapter to mock the backend
api.defaults.adapter = async (config) => {
  return new Promise((resolve, reject) => {
    console.log(`[Mock API] ${config.method?.toUpperCase()} ${config.url}`);
    
    setTimeout(async () => {
      try {
        const url = config.url || '';
        const method = config.method?.toLowerCase();
        let data: any = {};
        
        const fileToBase64 = (file: File): Promise<string> => new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        if (config.data) {
          if (config.data instanceof FormData) {
            for (const [key, value] of config.data.entries()) {
              if (value instanceof File) {
                const base64 = await fileToBase64(value);
                if (!data.images) data.images = [];
                data.images.push({ id: generateId(), image_path: base64, is_primary: data.images.length === 0 });
              } else {
                data[key] = value;
              }
            }
          } else if (typeof config.data === 'string') {
            try { data = JSON.parse(config.data); } catch { data = {}; }
          } else {
            data = config.data;
          }
        }
        
        const db = getDb();

        const response = (status: number, data: any) => resolve({
          data,
          status,
          statusText: 'OK',
          headers: {},
          config,
          request: {}
        });

        const error = (status: number, message: string) => reject({
          response: {
            status,
            data: { message }
          }
        });

        // 1. Auth routes
        if (url.includes('/login') && method === 'post') {
          const user = db.users.find(u => u.email === data.email && u.password === data.password);
          if (user) {
            localStorage.setItem('auth_token', user.id); // Simple mock token
            return response(200, { user, token: user.id });
          }
          return error(401, 'Invalid credentials');
        }

        if (url.includes('/register') && method === 'post') {
          const newUser = { id: generateId(), ...data, role: 'client' };
          db.users.push(newUser);
          saveDb(db);
          return response(201, { user: newUser, token: newUser.id });
        }

        if (url.includes('/user') && method === 'get') {
          const token = localStorage.getItem('auth_token');
          if (token) {
            const user = db.users.find(u => u.id === token);
            if (user) return response(200, user);
          }
          return error(401, 'Unauthenticated');
        }

        if (url.includes('/logout') && method === 'post') {
          localStorage.removeItem('auth_token');
          return response(200, { message: 'Logged out' });
        }

        // 2. Settings
        if (url.includes('/settings') && method === 'get') return response(200, db.settings);
        if (url.includes('/admin/settings') && method === 'put') {
          db.settings = { ...db.settings, ...data.settings };
          saveDb(db);
          return response(200, db.settings);
        }

        // 3. Categories
        if (url === '/categories' && method === 'get') return response(200, db.categories);
        if (url === '/categories' && method === 'post') {
          const cat = { id: generateId(), name: data.name, slug: data.name.toLowerCase().replace(/ /g, '-') };
          db.categories.push(cat);
          saveDb(db);
          return response(201, cat);
        }
        if (url.match(/^\/categories\/[^/]+$/) && method === 'put') {
          const id = url.split('/').pop();
          const index = db.categories.findIndex(c => c.id === id);
          if (index !== -1) {
            db.categories[index].name = data.name;
            saveDb(db);
            return response(200, db.categories[index]);
          }
        }
        if (url.match(/^\/categories\/[^/]+$/) && method === 'delete') {
          const id = url.split('/').pop();
          db.categories = db.categories.filter(c => c.id !== id);
          saveDb(db);
          return response(200, {});
        }

        // 4. Products
        if (url === '/products' && method === 'get') return response(200, db.products);
        if (url.match(/^\/products\/[^/]+$/) && method === 'get') {
          const id = url.split('/').pop();
          const item = db.products.find(p => p.id === id || String(p.id) === id);
          return item ? response(200, item) : error(404, 'Product not found');
        }
        if (url === '/products' && method === 'post') {
          let catLabel = '';
          if (data.category) {
            const cat = db.categories.find(c => c.slug === data.category || c.id === data.category);
            catLabel = cat ? cat.name : '';
          }
          const prod = { id: generateId(), ...data, categoryLabel: catLabel };
          db.products.push(prod);
          saveDb(db);
          return response(201, prod);
        }
        if (url.match(/^\/products\/[^/]+$/) && method === 'post') { // App uses POST to update product with FormData (mapped to JSON here loosely)
          const id = url.split('/').pop();
          const index = db.products.findIndex(p => p.id === id || String(p.id) === id);
          if (index !== -1) {
            db.products[index] = { ...db.products[index], ...data };
            saveDb(db);
            return response(200, db.products[index]);
          }
        }
        if (url.match(/^\/products\/[^/]+$/) && method === 'delete') {
            const id = url.split('/').pop();
            db.products = db.products.filter(p => p.id !== id && String(p.id) !== id);
            saveDb(db);
            return response(200, {});
        }

        // 5. Quotes (Client)
        if (url === '/quotes' && method === 'post') {
          const token = localStorage.getItem('auth_token');
          const user = db.users.find(u => u.id === token);
          const quote = { 
            id: generateId(), 
            user_id: user?.id, 
            status: 'pending', 
            company_name: data.company_name,
            company_nif: data.company_nif,
            items: data.items || [],
            created_at: new Date().toISOString(),
            messages: []
          };
          db.quotes.push(quote);
          saveDb(db);
          return response(201, { quote });
        }
        if (url === '/quotes' && method === 'get') {
          const token = localStorage.getItem('auth_token');
          const userQs = db.quotes.filter(q => q.user_id === token);
          return response(200, userQs);
        }
        // Admin Quotes
        if (url === '/admin/quotes' && method === 'get') return response(200, db.quotes);
        if (url.match(/^\/admin\/quotes\/[^/]+$/) && method === 'get') {
          const id = url.split('/').pop();
          const quote = db.quotes.find(q => q.id === id);
          return quote ? response(200, quote) : error(404, 'Quote not found');
        }
        if (url.match(/^\/admin\/quotes\/[^/]+\/messages$/) && method === 'get') {
          const id = url.split('/')[3];
          const quote = db.quotes.find(q => q.id === id);
          return response(200, quote?.messages || []);
        }

        // Update Quotes (Items, Status)
        if (url.match(/^\/admin\/quotes\/[^/]+\/items$/) && method === 'put') {
           const id = url.split('/')[3];
           const quote = db.quotes.find(q => q.id === id);
           if (quote) {
             quote.items = data.items;
             saveDb(db);
             return response(200, quote);
           }
        }
        if (url.match(/^\/admin\/quotes\/[^/]+$/) && method === 'put') {
           const id = url.split('/').pop();
           const quote = db.quotes.find(q => q.id === id);
           if (quote) {
             quote.status = data.status || quote.status;
             saveDb(db);
             return response(200, quote);
           }
        }

        // Quote Messages
        const handleMessage = (quoteId: string, isAdmin: boolean) => {
           const quote = db.quotes.find(q => q.id === quoteId);
           if (quote) {
              const msg = {
                 id: generateId(),
                 message: data.message,
                 is_admin: isAdmin,
                 created_at: new Date().toISOString()
              };
              quote.messages = quote.messages || [];
              quote.messages.push(msg);
              saveDb(db);
              return response(201, msg);
           }
           return error(404, 'Quote Not found');
        };
        if (url.match(/^\/quotes\/[^/]+\/messages$/) && method === 'post') {
           return handleMessage(url.split('/')[2], false);
        }
        if (url.match(/^\/admin\/quotes\/[^/]+\/messages$/) && method === 'post') {
           return handleMessage(url.split('/')[3], true);
        }

        // Quote Payment Reporting
        if (url.match(/^\/quotes\/[^/]+\/report-payment$/) && method === 'post') {
           const id = url.split('/')[2];
           const quote = db.quotes.find(q => q.id === id);
           if (quote) {
             quote.status = 'payment_reported';
             saveDb(db);
             return response(200, { message: 'Payment reported' });
           }
        }

        // Upload Invoice (Fake)
        if (url.match(/^\/admin\/quotes\/[^/]+\/upload-invoice$/) && method === 'post') {
           const id = url.split('/')[3];
           const quote = db.quotes.find(q => q.id === id);
           if (quote) {
             quote.invoice_url = '#fake-invoice-url'; // Simulating file upload
             saveDb(db);
             return response(200, quote);
           }
        }

        // 6. Dashboard (Admin)
        if (url === '/admin/dashboard' && method === 'get') {
          return response(200, {
            kpis: [
              { label: 'Receita Total', value: '4.2M MT', change: '+12.5%', trend: 'up', icon: 'DollarSign', color: 'text-primary' },
              { label: 'Novas Cotações', value: String(db.quotes.length), change: '+3', trend: 'up', icon: 'FileText', color: 'text-gold' },
              { label: 'Produtos Ativos', value: String(db.products.length), change: '0', trend: 'up', icon: 'Package', color: 'text-blue-600' },
              { label: 'Conversão B2B', value: '18%', change: '-2%', trend: 'down', icon: 'TrendingUp', color: 'text-whatsapp' }
            ],
            revenueData: [
              { month: 'Set', atual: 1200000, anterior: 1000000 },
              { month: 'Out', atual: 1800000, anterior: 1500000 },
              { month: 'Nov', atual: 2200000, anterior: 1900000 },
              { month: 'Dez', atual: 3100000, anterior: 2800000 },
              { month: 'Jan', atual: 3800000, anterior: 3400000 },
              { month: 'Fev', atual: 4200000, anterior: 3900000 }
            ],
            statusDistribution: [
              { name: 'Processando', value: 35, color: 'hsl(210, 100%, 20%)' },
              { name: 'Enviado', value: 25, color: 'hsl(210, 40%, 50%)' },
              { name: 'Entregue', value: 30, color: 'hsl(142, 70%, 45%)' },
              { name: 'Pendente', value: 10, color: 'hsl(24, 95%, 53%)' }
            ],
            funnelData: [
              { stage: 'Visitas', value: 1250 },
              { stage: 'RFQs Criadas', value: 450 },
              { stage: 'Negociações', value: 180 },
              { stage: 'Pedidos', value: 85 }
            ],
            recentOrders: [], // Orders section removed, returning empty array
            alerts: [
              { type: 'critical', message: 'Novo pedido urgente pendente de aprovação', time: 'Há 5 min' },
              { type: 'warning', message: 'Stock baixo: Cabo Industrial Blindado (SKU: CI-99)', time: 'Há 2 horas' }
            ]
          });
        }

        // 7. Orders
        // (Other order endpoints omitted for brevity, fallback will 404)

        // 7. Notifications
        if (url === '/notifications' && method === 'get') {
          const unread = db.notifications.filter(n => !n.read_at).length;
          return response(200, { notifications: db.notifications, unread_count: unread });
        }
        if (url === '/notifications/read-all' && method === 'post') {
          db.notifications.forEach(n => n.read_at = new Date().toISOString());
          saveDb(db);
          return response(200, {});
        }



        // Fallback for unhandled routes
        console.warn(`[Mock API] Unhandled ${method?.toUpperCase()} ${url}`);
        return response(200, { 
          data: [], 
          notifications: [], 
          unread_count: 0,
          kpis: [],
          revenueData: [],
          statusDistribution: [],
          funnelData: [],
          recentOrders: [],
          alerts: []
        }); 
      } catch (err) {
        console.error('[Mock API Error]', err);
        return resolve({ 
          status: 500, 
          statusText: 'Internal Error', 
          headers: {}, 
          config, 
          data: { message: 'Internal Mock Error' } 
        });
      }
    }, 300);
  });
};

export default api;
