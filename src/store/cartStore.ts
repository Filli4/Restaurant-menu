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
          const wasCartEmpty = state.items.length === 0; 
          const existingItem = state.items.find((i) => i.id === itemToAdd.id);

          let newItems;
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.id === itemToAdd.id ? { ...i, quantity: i.quantity + 1 } : i
            );
            return {
              items: newItems,
              
            };
          } else {
            newItems = [...state.items, { ...itemToAdd, quantity: 1 }];
            return {
              items: newItems,
             
              isCartPanelOpen: wasCartEmpty ? true : state.isCartPanelOpen,
            };
          }
        }),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
         
          isCartPanelOpen: state.items.filter((item) => item.id !== itemId).length > 0 ? state.isCartPanelOpen : false,
        })),

      incrementQuantity: (itemId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
          ),
         
        })),

      decrementQuantity: (itemId) =>
        set((state) => {
          const updatedItems = state.items
            .map((item) =>
              item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
            )
            .filter((item) => item.quantity > 0);
          
          
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