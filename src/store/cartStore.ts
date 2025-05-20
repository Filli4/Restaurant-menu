// src/store/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // För localStorage-persistens
import type { MenuItem } from '@/types/menu'; // Återanvänd din MenuItem-typ

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void; // Tar bort hela artikeln, oavsett kvantitet
  incrementQuantity: (itemId: string) => void;
  decrementQuantity: (itemId: string) => void;
  clearCart: () => void;
  // Getters (funktioner för att härleda data)
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist( // Lägger till persistens i localStorage
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),

      incrementQuantity: (itemId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
          ),
        })),

      decrementQuantity: (itemId) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
            )
            .filter((item) => item.quantity > 0), // Ta bort om kvantitet blir 0
        })),

      clearCart: () => set({ items: [] }),

      // Getters
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'restaurant-menu-cart', // Namn för localStorage-nyckeln
      storage: createJSONStorage(() => localStorage), // Använder localStorage
    }
  )
);

// Valfritt: Exportera typer för enklare användning i komponenter
export type { CartItem, MenuItem };