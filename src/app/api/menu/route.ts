// src/app/api/menu/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query /*, orderBy */ } from 'firebase/firestore'; // Removed orderBy for now, can be added if fields exist
import type { MenuCategory, MenuItem } from '@/types/menu';

// --- THIS IS THE CRUCIAL PART ---
// This ID is for the single document within 'menuCategories'
// that holds your actual category subcollections (Appetizers, MainCourses, Desserts).
// Replace with your actual document ID from Firestore.
const MENU_CONTAINER_DOCUMENT_ID = "lbb8idZiud8jKPCEKuia";
 // <--- UPDATE THIS!

// --- DEFINE YOUR CATEGORY SUBCOLLECTION NAMES HERE ---
// This is the order they will appear in.
const CATEGORY_SUBCOLLECTION_NAMES = ["Appetizers", "Main Courses", "Desserts"];

// Helper function to fetch items for a specific category subcollection
async function getItemsForCategorySubcollection(categorySubcollectionName: string): Promise<MenuItem[]> {
  // Path: /menuCategories/{MENU_CONTAINER_DOCUMENT_ID}/{categorySubcollectionName}
  const itemsCollectionRef = collection(db, 'menuCategories', MENU_CONTAINER_DOCUMENT_ID, categorySubcollectionName);

  // If your items have a field for ordering (e.g., 'name', 'orderIndex'), add orderBy here.
  // const itemsQuery = query(itemsCollectionRef, orderBy('name'));
  const itemsQuery = query(itemsCollectionRef); // Default order
  const itemsSnapshot = await getDocs(itemsQuery);

  const items: MenuItem[] = [];
  itemsSnapshot.forEach((itemDoc) => {
    const data = itemDoc.data();
    items.push({
      id: itemDoc.id,
      name: data.name as string,
      description: data.description as string,
      price: data.price as number,
      imageUrl: data.imageUrl as string,
    });
  });
  return items;
}

export async function GET(request: Request) {
  try {
    console.log(`Fetching menu using container document ID: ${MENU_CONTAINER_DOCUMENT_ID}`);
    const menuData: MenuCategory[] = [];

    // Iterate over your predefined category subcollection names
    for (const categoryName of CATEGORY_SUBCOLLECTION_NAMES) {
      console.log(`Processing category subcollection: ${categoryName}`);
      const items = await getItemsForCategorySubcollection(categoryName);

      menuData.push({
        id: categoryName, // e.g., "Appetizers"
        name: categoryName.replace(/([A-Z](?=[a-z]))/g, ' $1').trim(), // Format for display, e.g., "Main Courses"
        items: items,
      });
    }
    
    console.log("Final menuData to be sent:", JSON.stringify(menuData, null, 2));

    return NextResponse.json(menuData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });

  } catch (error) {
    console.error("Error fetching menu from Firestore:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch menu data", details: errorMessage },
      { status: 500 }
    );
  }
}
/* // src/app/api/menu/route.ts
import { NextResponse } from 'next/server';
import type { MenuCategory, MenuItem } from '@/types/menu'; // Import types

// Sample menu data (could be from a database in a real app)
const menuData: MenuCategory[] = [
  {
    id: 1,
    name: 'Appetizers',
    items: [
      { id: 101, name: 'Spring Rolls', description: 'Crispy vegetable spring rolls with sweet chili sauce rolls with sweet chili sauce .', price: 8.90, imageUrl: '/images/pexels-robinstickel-70497.jpg' },
      { id: 102, name: 'Garlic Bread', description: 'Toasted bread with garlic butter and herbs.', price: 6.50, imageUrl: '/images/pexels-fotios-photos-1279330.jpg' },
      { id: 103, name: 'Bruschetta', description: 'Grilled bread with tomato and basil.', price: 9.25, imageUrl: '/images/pexels-fotios-photos-1279330.jpg' },
    ],
  },
  {
    id: 2,
    name: 'Main Courses',
    items: [
      { id: 201, name: 'Grilled Salmon', description: 'Salmon fillet with asparagus.', price: 22.99, imageUrl: '/images/pexels-fotios-photos-1279330.jpg' },
      { id: 202, name: 'Pasta Carbonara', description: 'Classic Italian pasta.', price: 18.50, imageUrl: '/images/pexels-robinstickel-70497.jpg' },
      { id: 203, name: 'Steak Frites', description: 'Grilled steak with french fries.', price: 28.00, imageUrl: '/images/pexels-robinstickel-70497.jpg' },
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
  return NextResponse.json(
    menuData, // First argument: the body
    {         // Second argument: the init object (ResponseInit)
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate', // Aggressive no-caching
      },
    }
  );
} */