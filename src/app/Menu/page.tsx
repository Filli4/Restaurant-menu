// src/app/menu/page.tsx
'use client';

import { useEffect, useState } from 'react';
import type { MenuCategory } from '@/types/menu';
import MenuCategorySection from '@/components/menuCards/MenuCategorySection';

// Valfritt: Du kan skapa en mer generell LoadingSpinner-komponent
// import LoadingSpinner from '@/components/LoadingSpinner';

// Valfritt: Du kan skapa en mer generell ErrorDisplay-komponent
// import ErrorDisplay from '@/components/ErrorDisplay';

export default function MenuPage() {
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/menu');
        if (!response.ok) {
          let errorDetails = `Failed to fetch menu: ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorDetails = errorData.details || errorData.error || errorDetails;
          } catch (jsonError) { /* Ignore */ }
          throw new Error(errorDetails);
        }
        const data: MenuCategory[] = await response.json();
        setMenuData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching the menu.');
        console.error("Error fetching menu on page:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMenu();
  }, []);

  // --- HÄR ÄR ÄNDRINGARNA FÖR LAYOUT OCH FELHANTERING ---

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 sm:p-8 flex flex-col items-center justify-center text-center">
        {/* Återanvänd header-stilen om du vill, även under laddning */}
        <header className="mb-10 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
            Our Delicious Menu
          </h1>
        </header>
        <p className="text-xl text-gray-600">Loading delicious menu items...</p>
        <div className="mt-8 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 sm:p-8 flex flex-col items-center justify-center text-center">
        <header className="mb-10 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
            Our Delicious Menu
          </h1>
        </header>
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Oops! Something went wrong.</h2>
        <p className="text-gray-700 mb-2">We couldn't load the menu at this time.</p>
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">Error details: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Try Again
        </button>
         <footer className="text-center mt-16 sm:mt-24 py-8 border-t border-gray-200 w-full max-w-4xl">
          <p className="text-gray-600 text-sm">© {new Date().getFullYear()} The Awesome Restaurant. All rights reserved.</p>
          <p className="text-gray-500 text-xs mt-1">123 Food Street, Flavor Town, USA</p>
        </footer>
      </main>
    );
  }

  if (!menuData || menuData.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 sm:p-8 flex flex-col items-center justify-center text-center">
        <header className="mb-10 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
            Our Delicious Menu
          </h1>
        </header>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Menu Not Available</h2>
        <p className="text-gray-600">It seems there are no items on the menu right now. Please check back later!</p>
         <footer className="text-center mt-16 sm:mt-24 py-8 border-t border-gray-200 w-full max-w-4xl">
          <p className="text-gray-600 text-sm">© {new Date().getFullYear()} The Awesome Restaurant. All rights reserved.</p>
          <p className="text-gray-500 text-xs mt-1">123 Food Street, Flavor Town, USA</p>
        </footer>
      </main>
    );
  }

  // --- Huvudinnehållet när data har laddats ---
  return (
    <main className="min-h-screen bg-gray-50 p-4 py-8 sm:p-6 md:p-8 md:py-12">
      <header className="text-center mb-10 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
          Discover Our Menu {/* Du kan ändra denna text om du vill ha variation */}
        </h1>
        <p className="text-md sm:text-lg text-gray-600 mt-3 sm:mt-4 max-w-xl mx-auto">
          Fresh ingredients, crafted with passion. Explore our culinary delights.
        </p>
      </header>

      <div className="container mx-auto px-2 sm:px-0">
        {menuData.map((category) => (
          <MenuCategorySection key={category.id} category={category} />
        ))}
      </div>

      <footer className="text-center mt-16 sm:mt-24 py-8 border-t border-gray-200">
        <p className="text-gray-600 text-sm">© {new Date().getFullYear()} The Awesome Restaurant. All rights reserved.</p>
        <p className="text-gray-500 text-xs mt-1">123 Food Street, Flavor Town, USA</p>
      </footer>
    </main>
  );
}

// Du kan också lägga till metadata för /menu-sidan
// Detta fungerar bäst om du konverterar sidan till en Server Component,
// men Next.js kan försöka plocka upp det även för Client Components om det exporteras.
// För Client Components är det dock vanligare att hantera <title> via useEffect eller ett bibliotek.
// export const metadata = {
//   title: 'Full Menu | The Awesome Restaurant',
//   description: 'Browse our complete menu of appetizers, main courses, and desserts.',
// };