// src/components/Cart.tsx
'use client';

import React, { useState, useEffect } from 'react';
// Ta bort: import { useCart } from '../context/CartContext';
import { useCartStore } from '@/store/cartStore'; // Importera från Zustand store
import { db } from '@/lib/firebase'; // Din Firebase db-instans
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Firestore-funktioner

import {
  ShoppingCartIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';

export default function Cart() {
  // Hämta state och actions från Zustand-storen
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice); // Hämta funktionen
  const getTotalItems = useCartStore((state) => state.getTotalItems); // Hämta funktionen
  const removeItem = useCartStore((state) => state.removeItem);
  const incrementQuantity = useCartStore((state) => state.incrementQuantity);
  const decrementQuantity = useCartStore((state) => state.decrementQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  // Anropa getters för att få värdena
  const cartTotal = getTotalPrice();
  const itemCount = getTotalItems();

  const [userHasClosedCart, setUserHasClosedCart] = useState(false);
  const isPanelVisible = itemCount > 0 && !userHasClosedCart;

  // State för orderhantering
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);


  useEffect(() => {
    if (itemCount === 0) {
      setUserHasClosedCart(false);
      setOrderMessage(null); // Rensa meddelanden när varukorgen är tom
      setOrderError(null);
    }
  }, [itemCount]);

  const handleCheckout = async () => {
    if (items.length === 0) {
      setOrderError("Your cart is empty!");
      return;
    }

    setIsOrdering(true);
    setOrderMessage(null);
    setOrderError(null);

    try {
      const orderData = {
        items: items.map(item => ({ // Spara relevant info, inte hela objektet om onödigt
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl || null // Spara bild-URL om den finns
        })),
        totalPrice: cartTotal,
        totalItems: itemCount,
        createdAt: serverTimestamp(), // Använd Firebase server timestamp
        status: "pending", // Initial orderstatus
        // userId: currentUser ? currentUser.uid : null, // Om du har användarautentisering
      };

      const docRef = await addDoc(collection(db, "orders"), orderData); // Spara i en 'orders'-kollektion
      
      setOrderMessage(`Order placed successfully! Order ID: ${docRef.id}`);
      clearCart(); // Töm varukorgen efter lyckad beställning
    } catch (error) {
      console.error("Error placing order: ", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setOrderError(`Failed to place order. Please try again. Details: ${errorMessage}`);
    } finally {
      setIsOrdering(false);
    }
  };

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

  return (
    <div
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
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {items.length === 0 && isPanelVisible && !orderMessage && !orderError ? (
        <div className="flex-grow flex items-center justify-center p-4">
          <p className="text-center text-gray-500">Your cart is empty.</p>
        </div>
      ) : (
        <ul className="flex-grow space-y-2 p-4 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex-1 mr-3">
                <p className="font-medium text-gray-800 text-sm leading-tight">{item.name}</p>
                <p className="text-xs text-gray-500">
                  ${item.price.toFixed(2)} each {/* Byt till kr */}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => decrementQuantity(item.id)}
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  aria-label={`Decrease quantity of ${item.name}`}
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-gray-700 w-6 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => incrementQuantity(item.id)}
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  aria-label={`Increase quantity of ${item.name}`}
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="text-right ml-3 w-20">
                <p className="text-sm text-gray-800 font-semibold">
                  ${(item.price * item.quantity).toFixed(2)} {/* Byt till kr */}
                </p>
                <button
                  onClick={() => removeItem(item.id)} // Använd removeItem från storen
                  className="mt-1 text-xs text-red-500 hover:text-red-700 hover:underline"
                  aria-label={`Remove all ${item.name} from cart`}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Meddelanden för orderstatus */}
      {orderMessage && (
         <div className="p-4 text-center text-green-600 bg-green-50 border-t">{orderMessage}</div>
      )}
      {orderError && (
         <div className="p-4 text-center text-red-600 bg-red-50 border-t">{orderError}</div>
      )}


      {items.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <p className="text-md font-semibold text-gray-800">Subtotal:</p>
            <p className="text-lg font-bold text-emerald-600">
              ${cartTotal.toFixed(2)} {/* Byt till kr */}
            </p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isOrdering || items.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isOrdering ? 'Placing Order...' : 'Checkout'}
          </button>
        </div>
      )}
    </div>
  );
}