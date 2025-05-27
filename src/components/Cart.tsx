// src/components/Cart.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore, type CartItem as ZustandCartItem } from '@/store/cartStore';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import {
  ShoppingCartIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import ItemImageDisplay from './ItemImageDisplay';

export default function Cart() {
  const router = useRouter();
  
  // --- HYDRATION FIX START ---
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  // --- HYDRATION FIX END ---

  // Get Zustand store functions
  const storeItems = useCartStore((state) => state.items);
  const storeGetTotalPrice = useCartStore((state) => state.getTotalPrice);
  const storeGetTotalItems = useCartStore((state) => state.getTotalItems);
  const removeItem = useCartStore((state) => state.removeItem);
  const incrementQuantity = useCartStore((state) => state.incrementQuantity);
  const decrementQuantity = useCartStore((state) => state.decrementQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  // These values will be their defaults (0, empty array) before mount,
  // and actual values after mount.
  const itemCount = hasMounted ? storeGetTotalItems() : 0;
  const cartTotal = hasMounted ? storeGetTotalPrice() : 0;
  const currentCartItems = hasMounted ? storeItems : []; // Renamed to avoid conflict

  // Local state for UI, like whether the user explicitly closed the cart.
  // This should NOT be persisted across refreshes if we want the cart
  // to respect its default visibility based on itemCount after refresh.
  // If you WANT userHasClosedCart to persist, that's a separate problem
  // requiring careful localStorage syncing with the hasMounted pattern.
  // For now, let's assume it resets on refresh.
  const [userHasClosedCart, setUserHasClosedCart] = useState(false); 
  
  // isPanelVisible logic:
  // Before mount: itemCount is 0, userHasClosedCart is false -> isPanelVisible = false.
  // After mount: itemCount and userHasClosedCart have their client-side values.
  const isPanelVisible = itemCount > 0 && !userHasClosedCart;

  const [isOrdering, setIsOrdering] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    // This effect runs after mount.
    // If cart becomes empty, reset userHasClosedCart to ensure panel opens if items are added back.
    if (hasMounted && itemCount === 0) {
      setUserHasClosedCart(false);
      setOrderFeedback(null);
    }
  }, [itemCount, hasMounted]);

  const handleCheckout = async () => {
    if (currentCartItems.length === 0) {
      setOrderFeedback({type: "error", message: "Your cart is empty!"});
      return;
    }
    // ... (rest of checkout logic is fine)
    setIsOrdering(true);
    setOrderFeedback(null);
    try {
      const orderData = {
        items: currentCartItems.map(item => ({
          id: item.id, name: item.name, quantity: item.quantity,
          price: item.price, imageUrl: item.imageUrl || null
        })),
        totalPrice: cartTotal, totalItems: itemCount,
        createdAt: serverTimestamp(), status: "pending",
      };
      const docRef = await addDoc(collection(db, "orders"), orderData);
      clearCart();
      router.push(`/order-success/${docRef.id}`);
    } catch (error) {
      console.error("Error placing order: ", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setOrderFeedback({type: "error", message: `Failed to place order. Details: ${errorMessage}`});
    } finally {
      setIsOrdering(false);
    }
  };

  // --- PRE-MOUNT RENDER (MUST MATCH SERVER) ---
  if (!hasMounted) {
    // Server always renders the cart as if it's initially empty and closed by default.
    // So, `isPanelVisible` would be false. The main panel is hidden.
    // The "Open cart" button (floating) is also not rendered because itemCount is 0.
    // Thus, rendering the hidden panel structure is the most consistent.
    return (
      <div
        className={`
          fixed top-0 right-0 h-screen w-full sm:w-80 md:w-96 bg-white shadow-xl z-50
          flex flex-col
          transition-transform duration-300 ease-in-out
          transform translate-x-full 
        `} // Always hidden before mount to match server's initial isPanelVisible=false
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Your Cart</h3>
          {/* No close button visible as panel is hidden */}
        </div>
        <div className="flex-grow flex items-center justify-center p-4">
          {/* Minimal or no content, as it's hidden */}
        </div>
      </div>
    );
  }
  // --- END PRE-MOUNT RENDER ---


  // --- POST-MOUNT RENDERING LOGIC ---

  // Floating "Open cart" button (only if cart has items AND user explicitly closed it)
  if (itemCount > 0 && userHasClosedCart) {
    return (
      <button
        onClick={() => setUserHasClosedCart(false)}
        className="fixed top-1/4 right-0 z-40 -translate-y-1/2 p-2 bg-emerald-400 text-white rounded-l-md shadow-lg hover:bg-emerald-600 transition-colors"
        aria-label="Open cart"
      >
        <ShoppingCartIcon className="h-10 w-9" />
        <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
          {itemCount}
        </span>
      </button>
    );
  }

  // Main cart panel rendering (when hasMounted is true)
  const cartImageSize = 60;

  return (
    <div // This is the root div from the error stack (Cart.tsx:18 roughly)
      className={`
        fixed top-0 right-0 h-screen w-full sm:w-80 md:w-96 bg-white shadow-xl z-50
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${isPanelVisible ? 'transform translate-x-0' : 'transform translate-x-full'}
      `}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Your Cart</h3>
        <button
          onClick={() => setUserHasClosedCart(true)}
          className="p-1 text-gray-500 hover:text-gray-800"
          aria-label="Close cart"
          // Disable if cart is effectively not visible or empty
          disabled={!isPanelVisible || itemCount === 0}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {orderFeedback && orderFeedback.type === 'error' && (
         <div className="p-4 text-center text-red-600 bg-red-50 border-t">{orderFeedback.message}</div>
      )}

      {/* Use currentCartItems (which is [] before mount, then actual items after) */}
      {currentCartItems.length === 0 && isPanelVisible && !orderFeedback ? (
        <div className="flex-grow flex items-center justify-center p-4">
          <p className="text-center text-gray-500">Your cart is empty.</p>
        </div>
      ) : (
        // Only render list if there are items to prevent empty <ul> during loading/empty states
        currentCartItems.length > 0 && (
          <ul className="flex-grow space-y-2 p-4 overflow-y-auto">
            {currentCartItems.map((item: ZustandCartItem) => (
              <li key={item.id} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div
                  className="flex-shrink-0 rounded-md overflow-hidden relative bg-gray-100"
                  style={{ width: `${cartImageSize}px`, height: `${cartImageSize}px` }}
                >
                  <ItemImageDisplay
                    imagePath={item.imageUrl}
                    altText={item.name}
                    sizes={`${cartImageSize}px`}
                  />
                </div>
                <div className="flex-1 ml-3 mr-2">
                  <p className="font-medium text-gray-800 text-sm leading-tight">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center space-x-1.5 mr-2">
                  <button
                    onClick={() => decrementQuantity(item.id)}
                    className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
                    aria-label={`Decrease quantity of ${item.name}`}
                    disabled={item.quantity <= 1}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => incrementQuantity(item.id)}
                    className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-right w-auto min-w-[60px]">
                  <p className="text-sm text-gray-800 font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="mt-1 text-xs text-red-500 hover:text-red-700 hover:underline"
                    aria-label={`Remove all ${item.name} from cart`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )
      )}

       {currentCartItems.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <p className="text-md font-semibold text-gray-800">Subtotal:</p>
            <p className="text-lg font-bold text-emerald-600">
              ${cartTotal.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isOrdering || currentCartItems.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOrdering ? 'Placing Order...' : 'Checkout'}
          </button>
        </div>
      )}
    </div>
  );
}