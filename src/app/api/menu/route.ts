// src/app/api/menu/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import type { MenuCategory, MenuItem } from '@/types/menu';

const CATEGORY_SUBCOLLECTION_NAMES = ["Appetizers", "Main Courses", "Desserts","Drinks"];

async function getItemsForCategorySubcollection(
  menuContainerId: string, 
  categorySubcollectionName: string
): Promise<MenuItem[]> {
  // ... (your existing logic here, no changes needed)
  console.log(`[TEST_DEBUG] getItemsForCategorySubcollection: ENTER - Category: ${categorySubcollectionName}, Container: ${menuContainerId}`);
  const itemsCollectionRef = collection(db, 'menuCategories', menuContainerId, categorySubcollectionName);
  const itemsQuery = query(itemsCollectionRef);
  try {
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
  } catch (e) {
    console.error(`[TEST_DEBUG] getItemsForCategorySubcollection: ERROR in getDocs or processing:`, e);
    throw e;
  }
}

// THIS IS THE CORRECTED FUNCTION - 'export' has been removed
async function handleMenuGetRequest(
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
      const items = await getItemsForCategorySubcollection(menuContainerDocId, categoryName);
      menuData.push({
        id: categoryName,
        name: categoryName.replace(/([A-Z](?=[a-z]))/g, ' $1').trim(),
        items: items,
      });
    }
    return NextResponse.json(menuData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });

  } catch (error) {
    console.error("[TEST_DEBUG] handleMenuGetRequest: CATCH block - Error caught:", error);
    return NextResponse.json({ error: "Internal server error during test" }, { status: 503 });
  }
}

// THIS IS THE ONLY EXPORTED FUNCTION, WHICH IS CORRECT
export async function GET(request: Request): Promise<NextResponse> {
  const menuContainerIdFromEnv = process.env.NEXT_PUBLIC_MENU_CONTAINER_DOCUMENT_ID;
  // It calls the internal helper function above
  return handleMenuGetRequest(request, menuContainerIdFromEnv);
}