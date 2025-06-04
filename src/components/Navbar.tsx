// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cartStore'; // Adjust path if necessary
import React, { useState, useEffect } from 'react';

export default function Navbar() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Get state and actions from store
  const itemCount = useCartStore((state) => hasMounted ? state.getTotalItems() : 0); 
  const isCartPanelOpen = useCartStore((state) => state.isCartPanelOpen);
  const toggleCartPanel = useCartStore((state) => state.toggleCartPanel);

  const handleCartIconClick = () => {
    if (!hasMounted) return; // Guard against pre-hydration clicks
    toggleCartPanel(); // Simply toggle the panel's open state
  };

  // Pre-mount: can return null or a basic structure for the icon area
  if (!hasMounted) {
    // Or render a placeholder if you prefer
  }

  return (
    <nav className="bg-gray-800 text-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:text-gray-300 transition-colors">
          MyRestaurant {/* Or your project name */}
        </Link>
        
        <div className="flex items-center space-x-6">
         {/*  <ul className="flex space-x-6">
            <li>
              <Link
                href="/"
                className="hover:text-yellow-400 transition-colors pb-1 border-b-2 border-transparent hover:border-yellow-400"
              >
                Home
              </Link>
            </li> */}
            {/* Add more links here if needed */}
         {/* </ul>  */}

          {/* Cart Icon Button */}
          <button
            onClick={handleCartIconClick}
            className="relative p-2 hover:bg-gray-700 rounded-full transition-colors"
            aria-label={isCartPanelOpen ? "Close cart panel" : "Open cart panel"}
            disabled={!hasMounted} // Disable if not mounted
          >
            <ShoppingCartIcon className="h-6 w-6 text-white" />
            {itemCount > 0 && ( 
              <span 
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white"
                aria-label={`${itemCount} items in cart`}
              >
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}