'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Category, Ingredient, KOTTicket, MenuItem, Order, OrderItem, Recipe, Settings, Table, UUID } from '@/types/domain';
import { generateId } from '@/lib/utils';
import { idbStorage } from '@/lib/persist';

export type PosStore = AppState & {
  // Tables
  addTable: (table: Omit<Table, 'id' | 'status' | 'currentOrderId'>) => void;
  updateTable: (id: UUID, patch: Partial<Table>) => void;
  deleteTable: (id: UUID) => void;

  // Categories & Menu
  addCategory: (name: string) => void;
  deleteCategory: (id: UUID) => void;
  addMenuItem: (item: Omit<MenuItem, 'id' | 'isAvailable'>) => void;
  updateMenuItem: (id: UUID, patch: Partial<MenuItem>) => void;
  deleteMenuItem: (id: UUID) => void;

  // Ingredients & Inventory
  addIngredient: (ing: Omit<Ingredient, 'id' | 'currentStock'>) => void;
  updateIngredient: (id: UUID, patch: Partial<Ingredient>) => void;
  adjustStock: (id: UUID, delta: number) => void;
  deleteIngredient: (id: UUID) => void;

  // Recipes
  upsertRecipe: (menuItemId: UUID, items: Recipe['items']) => void;

  // Orders
  createOrder: (payload: { tableId?: UUID | null; type: Order['type'] }) => UUID;
  addItemToOrder: (orderId: UUID, item: { menuItemId: UUID; quantity?: number; notes?: string }) => void;
  updateOrderItem: (orderId: UUID, orderItemId: UUID, patch: Partial<OrderItem>) => void;
  removeOrderItem: (orderId: UUID, orderItemId: UUID) => void;
  sendToKitchen: (orderId: UUID) => void;
  setTicketStatus: (ticketId: UUID, status: KOTTicket['status']) => void;
  markItemsServed: (orderId: UUID, itemIds: UUID[]) => void;
  takePayment: (orderId: UUID, payment: Order['payments'][number]) => void;
  closeOrderIfPaid: (orderId: UUID) => void;

  // Settings
  updateSettings: (patch: Partial<Settings>) => void;

  // Data IO
  importState: (state: AppState) => void;
  exportState: () => AppState;

  // Seed
  seedDemo: () => void;
};

const initialState: AppState = {
  tables: [],
  categories: [],
  menu: [],
  recipes: [],
  ingredients: [],
  orders: [],
  kotTickets: [],
  settings: {
    cafeName: 'My Cafe',
    currency: 'USD',
    taxInclusive: false,
  },
};

function computeTotals(items: OrderItem[], taxRate = 0.05) {
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

export const usePosStore = create<PosStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Tables
      addTable: ({ name, capacity }) =>
        set((state) => ({
          tables: [
            ...state.tables,
            { id: generateId('tbl_'), name, capacity, status: 'free', currentOrderId: null },
          ],
        })),
      updateTable: (id, patch) =>
        set((state) => ({ tables: state.tables.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTable: (id) =>
        set((state) => ({ tables: state.tables.filter((t) => t.id !== id) })),

      // Categories & Menu
      addCategory: (name) =>
        set((state) => ({ categories: [...state.categories, { id: generateId('cat_'), name }] })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          menu: state.menu.filter((m) => m.categoryId !== id),
        })),
      addMenuItem: (item) =>
        set((state) => ({ menu: [...state.menu, { ...item, id: generateId('itm_'), isAvailable: true }] })),
      updateMenuItem: (id, patch) =>
        set((state) => ({ menu: state.menu.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      deleteMenuItem: (id) =>
        set((state) => ({ menu: state.menu.filter((m) => m.id !== id), recipes: state.recipes.filter((r) => r.menuItemId !== id) })),

      // Ingredients & Inventory
      addIngredient: (ing) =>
        set((state) => ({ ingredients: [...state.ingredients, { ...ing, id: generateId('ing_'), currentStock: 0 }] })),
      updateIngredient: (id, patch) =>
        set((state) => ({ ingredients: state.ingredients.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
      deleteIngredient: (id) => set((state) => ({ ingredients: state.ingredients.filter((i) => i.id !== id) })),
      adjustStock: (id, delta) =>
        set((state) => ({
          ingredients: state.ingredients.map((i) => (i.id === id ? { ...i, currentStock: Math.max(0, i.currentStock + delta) } : i)),
        })),

      // Recipes
      upsertRecipe: (menuItemId, items) =>
        set((state) => {
          const existing = state.recipes.find((r) => r.menuItemId === menuItemId);
          if (existing) {
            return { recipes: state.recipes.map((r) => (r.menuItemId === menuItemId ? { ...r, items } : r)) };
          }
          return { recipes: [...state.recipes, { id: generateId('rcp_'), menuItemId, items }] };
        }),

      // Orders
      createOrder: ({ tableId = null, type }) => {
        const id = generateId('ord_');
        const now = Date.now();
        const items: OrderItem[] = [];
        const { subtotal, tax, total } = computeTotals(items);
        set((state) => ({
          orders: [
            ...state.orders,
            { id, tableId, type, status: 'open', createdAt: now, items, subtotal, tax, total, payments: [] },
          ],
          tables: state.tables.map((t) => (t.id === tableId ? { ...t, status: 'occupied', currentOrderId: id } : t)),
        }));
        return id;
      },
      addItemToOrder: (orderId, { menuItemId, quantity = 1, notes }) =>
        set((state) => {
          const order = state.orders.find((o) => o.id === orderId);
          const menuItem = state.menu.find((m) => m.id === menuItemId);
          if (!order || !menuItem) return {} as any;
          const newItem: OrderItem = {
            id: generateId('oi_'),
            menuItemId,
            name: menuItem.name,
            price: menuItem.price,
            quantity,
            notes,
            status: 'new',
          };
          const items = [...order.items, newItem];
          const totals = computeTotals(items);
          return {
            orders: state.orders.map((o) => (o.id === orderId ? { ...o, items, ...totals } : o)),
          };
        }),
      updateOrderItem: (orderId, orderItemId, patch) =>
        set((state) => {
          const order = state.orders.find((o) => o.id === orderId);
          if (!order) return {} as any;
          const items = order.items.map((it) => (it.id === orderItemId ? { ...it, ...patch } : it));
          const totals = computeTotals(items);
          return { orders: state.orders.map((o) => (o.id === orderId ? { ...o, items, ...totals } : o)) };
        }),
      removeOrderItem: (orderId, orderItemId) =>
        set((state) => {
          const order = state.orders.find((o) => o.id === orderId);
          if (!order) return {} as any;
          const items = order.items.filter((it) => it.id !== orderItemId);
          const totals = computeTotals(items);
          return { orders: state.orders.map((o) => (o.id === orderId ? { ...o, items, ...totals } : o)) };
        }),
      sendToKitchen: (orderId) =>
        set((state) => {
          const order = state.orders.find((o) => o.id === orderId);
          if (!order) return {} as any;
          const unsent = order.items.filter((it) => it.status === 'new');
          if (unsent.length === 0) return {} as any;
          const ticketId = generateId('kot_');
          const now = Date.now();
          const ticket: KOTTicket = {
            id: ticketId,
            orderId,
            itemIds: unsent.map((u) => u.id),
            status: 'queued',
            createdAt: now,
            updatedAt: now,
          };
          const updatedOrder: Order = {
            ...order,
            items: order.items.map((it) => (it.status === 'new' ? { ...it, status: 'queued' } : it)),
          };
          return {
            kotTickets: [...state.kotTickets, ticket],
            orders: state.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
          };
        }),
      setTicketStatus: (ticketId, status) =>
        set((state) => ({
          kotTickets: state.kotTickets.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: Date.now() } : t)),
          orders: state.orders.map((o) => {
            const t = state.kotTickets.find((k) => k.id === ticketId);
            if (!t || o.id !== t.orderId) return o;
            let nextItems = o.items;
            if (status === 'preparing') {
              nextItems = o.items.map((it) => (t.itemIds.includes(it.id) ? { ...it, status: 'preparing' } : it));
            }
            if (status === 'ready') {
              nextItems = o.items.map((it) => (t.itemIds.includes(it.id) ? { ...it, status: 'ready' } : it));
            }
            return { ...o, items: nextItems };
          }),
        })),
      markItemsServed: (orderId, itemIds) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, items: o.items.map((it) => (itemIds.includes(it.id) ? { ...it, status: 'served' } : it)) }
              : o,
          ),
        })),
      takePayment: (orderId, payment) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, payments: [...o.payments, payment] } : o,
          ),
        })),
      closeOrderIfPaid: (orderId) =>
        set((state) => {
          const order = state.orders.find((o) => o.id === orderId);
          if (!order) return {} as any;
          const paid = order.payments.reduce((s, p) => s + p.amount, 0);
          if (paid + 1e-6 >= order.total) {
            // consume inventory based on recipes
            const recipeMap = new Map(state.recipes.map((r) => [r.menuItemId, r]));
            let ingredients = state.ingredients;
            for (const it of order.items) {
              const r = recipeMap.get(it.menuItemId);
              if (!r) continue;
              for (const ri of r.items) {
                ingredients = ingredients.map((ing) =>
                  ing.id === ri.ingredientId
                    ? { ...ing, currentStock: Math.max(0, ing.currentStock - ri.quantity * it.quantity) }
                    : ing,
                );
              }
            }
            return {
              ingredients,
              orders: state.orders.map((o) => (o.id === orderId ? { ...o, status: 'paid' } : o)),
              tables: state.tables.map((t) => (t.id === order.tableId ? { ...t, status: 'free', currentOrderId: null } : t)),
            };
          }
          return {} as any;
        }),

      // Settings
      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),

      // Data IO
      importState: (state) => set(() => ({ ...state })),
      exportState: () => ({ ...get() }),

      // Seed
      seedDemo: () =>
        set(() => {
          const catCoffee: Category = { id: generateId('cat_'), name: 'Coffee' };
          const catFood: Category = { id: generateId('cat_'), name: 'Food' };
          const espresso: MenuItem = { id: generateId('itm_'), name: 'Espresso', categoryId: catCoffee.id, price: 3, taxRate: 0.05, isAvailable: true };
          const latte: MenuItem = { id: generateId('itm_'), name: 'Latte', categoryId: catCoffee.id, price: 4.5, taxRate: 0.05, isAvailable: true };
          const croissant: MenuItem = { id: generateId('itm_'), name: 'Croissant', categoryId: catFood.id, price: 2.75, taxRate: 0.05, isAvailable: true };
          const beans: Ingredient = { id: generateId('ing_'), name: 'Coffee Beans', unit: 'g', currentStock: 1000, reorderLevel: 200 };
          const milk: Ingredient = { id: generateId('ing_'), name: 'Milk', unit: 'ml', currentStock: 3000, reorderLevel: 500 };
          const dough: Ingredient = { id: generateId('ing_'), name: 'Dough', unit: 'g', currentStock: 2000, reorderLevel: 300 };
          const rEspresso: Recipe = { id: generateId('rcp_'), menuItemId: espresso.id, items: [ { ingredientId: beans.id, quantity: 18 } ] };
          const rLatte: Recipe = { id: generateId('rcp_'), menuItemId: latte.id, items: [ { ingredientId: beans.id, quantity: 18 }, { ingredientId: milk.id, quantity: 220 } ] };
          const rCroissant: Recipe = { id: generateId('rcp_'), menuItemId: croissant.id, items: [ { ingredientId: dough.id, quantity: 90 } ] };
          const tables: Table[] = [1,2,3,4,5,6].map((n) => ({ id: generateId('tbl_'), name: `T${n}`, capacity: 2 + (n % 3) * 2, status: 'free', currentOrderId: null }));
          return {
            tables,
            categories: [catCoffee, catFood],
            menu: [espresso, latte, croissant],
            ingredients: [beans, milk, dough],
            recipes: [rEspresso, rLatte, rCroissant],
          } as Partial<AppState> as any;
        }),
    }),
    {
      name: 'pos-state',
      version: 1,
      storage: {
        getItem: async (name: string) => {
          const value = await idbStorage.getItem(name);
          return value ? { state: value, version: 1 } : null;
        },
        setItem: async (name: string, value: any) => {
          await idbStorage.setItem(name, value.state ?? value);
        },
        removeItem: async (name: string) => {
          await idbStorage.removeItem(name);
        },
      },
      partialize: (state) => ({
        tables: state.tables,
        categories: state.categories,
        menu: state.menu,
        recipes: state.recipes,
        ingredients: state.ingredients,
        orders: state.orders,
        kotTickets: state.kotTickets,
        settings: state.settings,
      }),
    },
  ),
);
