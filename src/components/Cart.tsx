// src/components/Cart.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore, type CartItem as ZustandCartItem } from '@/store/cartStore';
import { db } from '@/lib/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import ItemImageDisplay from './ItemImageDisplay'; 

export default function Cart() {
  const router = useRouter();
  
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Get states and actions from Zustand store
  const storeItems = useCartStore((state) => state.items);
  const storeGetTotalPrice = useCartStore((state) => state.getTotalPrice);
  const itemCount = useCartStore((state) => hasMounted ? state.getTotalItems() : 0); 
  
  const removeItem = useCartStore((state) => state.removeItem);
  const incrementQuantity = useCartStore((state) => state.incrementQuantity);
  const decrementQuantity = useCartStore((state) => state.decrementQuantity);
  const clearCart = useCartStore((state) => state.clearCart); 
  // clearCart will also close panel

  const isCartPanelOpen = useCartStore((state) => state.isCartPanelOpen);
  const toggleCartPanel = useCartStore((state) => state.toggleCartPanel);

  // Derived values
  const cartTotal = hasMounted ? storeGetTotalPrice() : 0;
  const currentCartItems = hasMounted ? storeItems : [];
  
  // This is the sole determinant of panel visibility from CSS perspective
  const panelShouldBeVisible = hasMounted && isCartPanelOpen;

  // Local UI state
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Effect to clear feedback if panel is open and cart becomes empty, or if panel closes
  useEffect(() => {
    if (hasMounted && isCartPanelOpen && itemCount === 0) {
      setOrderFeedback(null);
    }
    if (hasMounted && !isCartPanelOpen) {
        setOrderFeedback(null);
    }
  }, [itemCount, hasMounted, isCartPanelOpen]); 

  const handleCheckout = async () => {
    if (currentCartItems.length === 0) {
      setOrderFeedback({type: "error", message: "Your cart is empty!"});
      return;
    }
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
      
      // Calling clearCart() will now:
      // 1. Empty the items array in the store.
      // 2. Set isCartPanelOpen to false in the store.
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

  // Pre-mount rendering (panel always hidden)
  if (!hasMounted) {
    return (
      <div
        className={`
          fixed right-0 h-5/6 w-full sm:w-80 md:w-96 bg-white shadow-xl z-50
          flex flex-col
          transition-transform duration-300 ease-in-out
          transform translate-x-full 
        `}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Your Cart</h3>
        </div>
        <div className="flex-grow flex items-center justify-center p-4"></div>
      </div>
    );
  }

  const cartImageSize = 60; // Define image size for cart items

  // Post-mount rendering
  return (
    <div
      className={`
        fixed  right-0 h-4/6 w-full sm:w-80 md:w-96 bg-white shadow-xl z-50 
        flex flex-col overscroll-contain
        transition-transform duration-300 ease-in-out
        ${panelShouldBeVisible ? 'transform translate-x-0' : 'transform translate-x-full'}
      `}
    >
      {/* Cart Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Your Cart</h3>
        <button
          onClick={toggleCartPanel} // Closes the panel
          className="p-1 text-gray-500 hover:text-gray-800"
          aria-label="Close cart"
          disabled={!panelShouldBeVisible} 
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Cart Body - only rendered if panel should be visible */}
      {panelShouldBeVisible && (
        <>
          {/* Order Feedback */}
          {orderFeedback && orderFeedback.type === 'error' && (
            <div className="p-4 text-center text-red-600 bg-red-50 border-t">{orderFeedback.message}</div>
          )}

          {/* Empty Cart Message */}
          {itemCount === 0 && !orderFeedback ? (
            <div className="flex-grow flex items-center justify-center p-4">
              <p className="text-center text-gray-500">Your cart is empty.</p>
            </div>
          ) : (
            // Cart Items List
            itemCount > 0 && ( 
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

          {/* Cart Footer - Checkout Section */}
          {itemCount > 0 && ( 
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
        </>
      )}
    </div>
  );
}