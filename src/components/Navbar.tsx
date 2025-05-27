// src/components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* You can replace "MyRestaurant" with your project name or logo */}
        <Link href="/" className="text-2xl font-bold hover:text-gray-300 transition-colors">
          MyRestaurant
        </Link>
        <ul className="flex space-x-6">
          <li>
            <Link
              href="/"
              className="hover:text-yellow-400 transition-colors pb-1 border-b-2 border-transparent hover:border-yellow-400"
            >
              Home
            </Link>
          </li>
          
          {/* Add more links here if needed */}
        </ul>
      </div>
    </nav>
  );
}