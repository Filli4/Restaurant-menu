// src/app/page.tsx
import MenuCategorySection from '@/components/MenuCategorySection';
import { MenuCategory } from '@/types/menu';

async function getMenuData(): Promise<MenuCategory[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/menu`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('Failed to fetch menu data');
    return res.json();
  } catch (error) {
    console.error("Error fetching menu data:", error);
    return [];
  }
}

export default async function HomePage() {
  const menuData = await getMenuData();

  if (!menuData || menuData.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600">Oops!</h1>
          <p className="text-md sm:text-lg text-gray-700 mt-2">
            We couldn't load the menu right now. Please try again later.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 py-8 sm:p-6 md:p-8 md:py-12"> {/* Lighter background, responsive padding */}
      <header className="text-center mb-10 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
          Our Delicious Menu
        </h1>
        <p className="text-md sm:text-lg text-gray-600 mt-3 sm:mt-4 max-w-xl mx-auto">
          Fresh ingredients, crafted with passion. Explore our culinary delights.
        </p>
      </header>

      <div className="container mx-auto px-2 sm:px-0"> {/* Added small horizontal padding for container on smallest screens */}
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

export const metadata = {
  title: 'Restaurant Menu | The Awesome Restaurant',
  description: 'Explore our delicious range of appetizers, main courses, and desserts, all made with the freshest ingredients.',
};