export type UUID = string;

export type Table = {
  id: UUID;
  name: string;
  capacity: number;
  status: 'free' | 'occupied' | 'reserved';
  currentOrderId?: UUID | null;
};

export type Category = {
  id: UUID;
  name: string;
};

export type MenuItem = {
  id: UUID;
  name: string;
  categoryId: UUID;
  price: number; // in smallest currency unit? we'll use number dollars
  taxRate: number; // e.g., 0.05 for 5%
  isAvailable: boolean;
  sku?: string;
};

export type Ingredient = {
  id: UUID;
  name: string;
  unit: 'g' | 'kg' | 'ml' | 'l' | 'pcs';
  currentStock: number;
  reorderLevel: number;
};

export type RecipeItem = {
  ingredientId: UUID;
  quantity: number; // in ingredient unit
};

export type Recipe = {
  id: UUID;
  menuItemId: UUID;
  items: RecipeItem[];
};

export type OrderItem = {
  id: UUID;
  menuItemId: UUID;
  name: string; // snapshot of name
  price: number; // snapshot of price
  quantity: number;
  notes?: string;
  status: 'new' | 'queued' | 'preparing' | 'ready' | 'served';
};

export type Order = {
  id: UUID;
  tableId?: UUID | null;
  type: 'dine-in' | 'takeaway';
  status: 'open' | 'paid' | 'cancelled';
  createdAt: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  payments: Payment[];
};

export type Payment = {
  id: UUID;
  method: 'cash' | 'card' | 'upi' | 'other';
  amount: number;
  paidAt: number;
};

export type KOTTicket = {
  id: UUID;
  orderId: UUID;
  itemIds: UUID[];
  status: 'queued' | 'preparing' | 'ready';
  createdAt: number;
  updatedAt: number;
};

export type Settings = {
  cafeName: string;
  currency: string; // e.g., INR, USD
  taxInclusive: boolean;
};

export type AppState = {
  tables: Table[];
  categories: Category[];
  menu: MenuItem[];
  recipes: Recipe[];
  ingredients: Ingredient[];
  orders: Order[];
  kotTickets: KOTTicket[];
  settings: Settings;
};
