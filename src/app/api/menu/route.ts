// src/app/api/menu/route.ts
import { NextResponse } from 'next/server';
import type { MenuCategory, MenuItem } from '@/types/menu'; // Import types

// Sample menu data (could be from a database in a real app)
const menuData: MenuCategory[] = [
  {
    id: 1,
    name: 'Appetizers',
    items: [
      { id: 101, name: 'Spring Rolls', description: 'Crispy vegetable spring rolls with sweet chili sauce.', price: 8.99, imageUrl: '/images/pexels-robinstickel-70497.jpg' },
      { id: 102, name: 'Garlic Bread', description: 'Toasted bread with garlic butter and herbs.', price: 6.50, imageUrl: '/images/pexels-fotios-photos-1279330.jpg' },
      { id: 103, name: 'Bruschetta', description: 'Grilled bread with tomato and basil.', price: 9.25, imageUrl: '/images/pexels-fotios-photos-1279330.jpg' },
    ],
  },
  {
    id: 2,
    name: 'Main Courses',
    items: [
      { id: 201, name: 'Grilled Salmon', description: 'Salmon fillet with asparagus.', price: 22.99, imageUrl: '/images/pexels-fotios-photos-1279330.jpg' },
      { id: 202, name: 'Pasta Carbonara', description: 'Classic Italian pasta.', price: 18.50, imageUrl: '/images/pexels-robinstickel-70497.jpg' }, // CORRECTED
      { id: 203, name: 'Steak Frites', description: 'Grilled steak with french fries.', price: 28.00, imageUrl: '/images/pexels-robinstickel-70497.jpg' }, // CORRECTED
    ],
  },
  {
    id: 3,
    name: 'Desserts',
    items: [
      { id: 301, name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center.', price: 9.99, imageUrl: '/images/pexels-robinstickel-70497.jpg' },
      { id: 302, name: 'Tiramisu', description: 'Classic Italian coffee-flavored dessert.', price: 8.75, imageUrl: '/images/pexels-robinstickel-70497.jpg' },
    ],
  },
];

export async function GET(request: Request) {
  return NextResponse.json(menuData);
}