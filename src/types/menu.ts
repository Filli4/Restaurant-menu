// src/types/menu.ts
export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string; // Image URL is now more prominent
  }
  
  export interface MenuCategory {
    id: string;
    name: string;
    items: MenuItem[];
  }

  // We'll also need a type for items *in* the cart, which includes quantity
export interface CartItem extends MenuItem {
  quantity: number;
}

