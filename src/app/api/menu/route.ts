// src/app/api/menu/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // Imports the initialized db instance
import { collection, getDocs, query } from 'firebase/firestore';
import type { MenuCategory, MenuItem } from '@/types/menu';

const CATEGORY_SUBCOLLECTION_NAMES = ["Appetizers", "Main Courses", "Desserts","Drinks"];

async function getItemsForCategorySubcollection(
  menuContainerId: string, 
  categorySubcollectionName: string
): Promise<MenuItem[]> {
  console.log(`[TEST_DEBUG] getItemsForCategorySubcollection: ENTER - Category: ${categorySubcollectionName}, Container: ${menuContainerId}`);
  console.log(`[TEST_DEBUG] getItemsForCategorySubcollection: db object is: ${JSON.stringify(db)}`); // Log the db object
  
  const itemsCollectionRef = collection(db, 'menuCategories', menuContainerId, categorySubcollectionName);
  console.log(`[TEST_DEBUG] getItemsForCategorySubcollection: AFTER collection() call - Ref: ${JSON.stringify(itemsCollectionRef).substring(0, 100)}`);

  const itemsQuery = query(itemsCollectionRef);
  console.log(`[TEST_DEBUG] getItemsForCategorySubcollection: AFTER query() call - Query: ${JSON.stringify(itemsQuery).substring(0,100)}`);

  try {
    const itemsSnapshot = await getDocs(itemsQuery);
    console.log(`[TEST_DEBUG] getItemsForCategorySubcollection: AFTER await getDocs() - Snapshot empty: ${itemsSnapshot.empty}`);

    const items: MenuItem[] = [];
    itemsSnapshot.forEach((itemDoc) => {
      console.log(`[TEST_DEBUG] getItemsForCategorySubcollection: Processing itemDoc ID: ${itemDoc.id}`);
      const data = itemDoc.data();
      items.push({
        id: itemDoc.id,
        name: data.name as string,
        description: data.description as string,
        price: data.price as number,
        imageUrl: data.imageUrl as string,
      });
    });
    console.log(`[TEST_DEBUG] getItemsForCategorySubcollection: EXIT - Returning ${items.length} items`);
    return items;
  } catch (e) {
    console.error(`[TEST_DEBUG] getItemsForCategorySubcollection: ERROR in getDocs or processing:`, e);
    throw e; // Re-throw to be caught by the main handler
  }
}

export async function handleMenuGetRequest(
    _request: Request,
    menuContainerDocId: string | undefined
): Promise<NextResponse> {
  console.log(`[TEST_DEBUG] handleMenuGetRequest: ENTER - ID: ${menuContainerDocId}`);
  if (!menuContainerDocId) {
    console.log("[TEST_DEBUG] handleMenuGetRequest: ID is undefined, returning 500.");
    return NextResponse.json(
      { error: "Server configuration error. Please contact support." },
      { status: 500 }
    );
  }

  try {
    console.log(`[TEST_DEBUG] handleMenuGetRequest: TRY block - Fetching menu using container ID: ${menuContainerDocId}`);
    const menuData: MenuCategory[] = [];

    for (const categoryName of CATEGORY_SUBCOLLECTION_NAMES) {
      console.log(`[TEST_DEBUG] handleMenuGetRequest: LOOP - Processing category: ${categoryName}`);
      const items = await getItemsForCategorySubcollection(menuContainerDocId, categoryName);
      console.log(`[TEST_DEBUG] handleMenuGetRequest: LOOP - Received ${items.length} items for ${categoryName}`);
      menuData.push({
        id: categoryName,
        name: categoryName.replace(/([A-Z](?=[a-z]))/g, ' $1').trim(),
        items: items,
      });
    }
    
    console.log("[TEST_DEBUG] handleMenuGetRequest: TRY block - Successfully processed all categories. MenuData length:", menuData.length);
    return NextResponse.json(menuData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });

  } catch (error) {
    // SIMPLIFIED CATCH BLOCK FOR DEBUGGING
    console.error("[TEST_DEBUG] handleMenuGetRequest: CATCH block - Error caught:", error);
    // Directly return, bypassing complex error message construction for now
    return NextResponse.json({ error: "Internal server error during test" }, { status: 503 }); // Use 503 to distinguish
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  const menuContainerIdFromEnv = process.env.NEXT_PUBLIC_MENU_CONTAINER_DOCUMENT_ID;
  return handleMenuGetRequest(request, menuContainerIdFromEnv);
}