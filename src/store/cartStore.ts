// src/store/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MenuItem } from '@/types/menu';

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isCartPanelOpen: boolean;

  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  incrementQuantity: (itemId: string) => void;
  decrementQuantity: (itemId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  toggleCartPanel: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartPanelOpen: false,

      addItem: (itemToAdd: MenuItem) =>
        set((state) => {
          const wasCartEmpty = state.items.length === 0; // Check if cart was empty BEFORE adding
          const existingItem = state.items.find((i) => i.id === itemToAdd.id);

          let newItems;
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.id === itemToAdd.id ? { ...i, quantity: i.quantity + 1 } : i
            );
            return {
              items: newItems,
              // For existing items, DO NOT change isCartPanelOpen
              // isCartPanelOpen: state.isCartPanelOpen 
            };
          } else {
            newItems = [...state.items, { ...itemToAdd, quantity: 1 }];
            return {
              items: newItems,
              // Auto-open panel ONLY if the cart was previously empty
              isCartPanelOpen: wasCartEmpty ? true : state.isCartPanelOpen,
            };
          }
        }),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
          // Consider if panel should close if cart becomes empty.
          // isCartPanelOpen: state.items.filter((item) => item.id !== itemId).length > 0 ? state.isCartPanelOpen : false,
        })),

      incrementQuantity: (itemId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
          ),
          // DO NOT change isCartPanelOpen on increment
        })),

      decrementQuantity: (itemId) =>
        set((state) => {
          const updatedItems = state.items
            .map((item) =>
              item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
            )
            .filter((item) => item.quantity > 0);
          
          // If cart becomes empty after decrement, decide if panel should close.
          // Let's keep it open to show "empty" message if it was already open.
          // User can close via toggle or clearCart.
          return { items: updatedItems };
        }),

      clearCart: () => set({ 
        items: [],
        isCartPanelOpen: false 
      }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      toggleCartPanel: () => set((state) => ({ isCartPanelOpen: !state.isCartPanelOpen })),

    }),
    {
      name: 'restaurant-menu-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
          items: state.items, 
          isCartPanelOpen: state.isCartPanelOpen 
      }),
    }
  )
);

export type { MenuItem };