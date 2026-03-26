import { allProducts } from '../data/products';

const MOCK_DB_KEY = 'ne_equipment_mock_db';

interface MockDBState {
  users: any[];
  products: any[];
  categories: any[];
  quotes: any[];
  orders: any[];
  notifications: any[];
  settings: any;
}

const defaultDB: MockDBState = {
  users: [
    { id: '1', name: 'Admin User', email: 'admin@ne-equipment.com', password: 'password', role: 'admin', nif: '123456789' },
    { id: '2', name: 'Client User', email: 'client@company.com', password: 'password', role: 'client', nif: '987654321', company_name: 'Tech Company LDA' }
  ],
  products: allProducts,
  categories: [
    { id: 'cat-1', name: 'EPI\'s', slug: 'epi' },
    { id: 'cat-2', name: 'Hospitalar', slug: 'hospital' },
    { id: 'cat-3', name: 'Informática', slug: 'it' },
    { id: 'cat-4', name: 'Industrial', slug: 'industrial' },
    { id: 'cat-5', name: 'Lubrificantes', slug: 'oil' },
    { id: 'cat-6', name: 'Mobiliário', slug: 'furniture' },
    { id: 'cat-7', name: 'Agrícola', slug: 'agricultural' }
  ],
  quotes: [],
  orders: [],
  notifications: [],
  settings: {
    bank_name: 'Banco Exemplo',
    bank_iban: 'AO06 0000 0000 0000 0000 0000 0',
    contact_email: 'geral@ne-equipment.com'
  }
};

export const getDb = (): MockDBState => {
  const data = localStorage.getItem(MOCK_DB_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return defaultDB;
    }
  }
  return defaultDB;
};

export const saveDb = (db: MockDBState) => {
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
};

export const initDb = () => {
  if (!localStorage.getItem(MOCK_DB_KEY)) {
    saveDb(defaultDB);
  }
};

initDb();

export const generateId = () => Math.random().toString(36).substring(2, 9);
