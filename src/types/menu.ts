// src/types/menu.ts
export interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string; // Image URL is now more prominent
  }
  
  export interface MenuCategory {
    id: number;
    name: string;
    items: MenuItem[];
  }