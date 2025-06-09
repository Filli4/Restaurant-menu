// src/types/menu.ts
export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string; 
  }
  
  export interface MenuCategory {
    id: string;
    name: string;
    items: MenuItem[];
  }

  
export interface CartItem extends MenuItem {
  quantity: number;
}

