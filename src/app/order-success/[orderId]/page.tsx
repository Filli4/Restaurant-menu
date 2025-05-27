// app/order-success/[orderId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import ItemImageDisplay from '@/components/ItemImageDisplay'; // Using the refactored component

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string | null; // Path to image in Firebase Storage
}

interface OrderData {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  totalItems: number;
  createdAt: Timestamp;
  status: string;
}

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchOrder = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);
      try {
        const orderDocRef = doc(db, 'orders', orderId);
        const orderDocSnap = await getDoc(orderDocRef);

        if (orderDocSnap.exists()) {
          const data = orderDocSnap.data();
          if (isMounted) {
            setOrder({
              id: orderDocSnap.id,
              items: data.items || [],
              totalPrice: data.totalPrice || 0,
              totalItems: data.totalItems || 0,
              createdAt: data.createdAt as Timestamp, // Ensure createdAt is treated as Timestamp
              status: data.status || 'Unknown',
            } as OrderData); // Cast to OrderData
          }
        } else {
          if (isMounted) setError('Order not found. Please check the ID or contact support.');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to fetch order details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrder();

    return () => { 
      isMounted = false; 
    };
  }, [orderId]);

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp || !(timestamp instanceof Timestamp)) return 'N/A'; // Add check for Timestamp instance
    try {
      return timestamp.toDate().toLocaleString();
    } catch (e) {
      console.error("Error formatting date:", e, timestamp);
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="ml-4 text-lg text-gray-700">Loading your order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-8 text-center min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-red-600 mb-3">Error Loading Order</h1>
            <p className="text-gray-700 mb-6">{error}</p>
            <Link href="/" legacyBehavior>
            <a className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                Go to Homepage
            </a>
            </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    // This case should ideally be covered by the error 'Order not found'
    return (
      <div className="container mx-auto p-4 sm:p-8 text-center min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-gray-700 text-lg">Order details could not be loaded.</p>
      </div>
    );
  }

  const orderImageSize = 70; // Define size for order summary images

  return (
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto max-w-2xl p-4 sm:p-6 md:p-8 bg-white shadow-xl rounded-lg">
        <div className="text-center mb-8">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Thank You for Your Order!</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Your order has been placed successfully.</p>
        </div>

        <div className="border-t border-b border-gray-200 py-6 my-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm sm:text-base text-gray-600">
            <div className="flex justify-between">
              <span>Order ID:</span>
              <span className="font-medium text-gray-800 break-all">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Order Date:</span>
              <span className="font-medium text-gray-800">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Order Status:</span>
              <span className="font-medium capitalize px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs sm:text-sm">{order.status}</span>
            </div>
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Items Ordered ({order.totalItems})</h3>
        <ul className="space-y-4 mb-6">
          {order.items.map((item: OrderItem) => (
            <li key={item.id} className="flex items-center space-x-3 sm:space-x-4 p-3 bg-gray-50 rounded-md shadow-sm">
              {/* Parent div for ItemImageDisplay, providing size and relative positioning */}
              <div
                className="flex-shrink-0 rounded-md overflow-hidden relative bg-gray-100" /* bg for loading/error placeholder */
                style={{ width: `${orderImageSize}px`, height: `${orderImageSize}px` }}
              >
                <ItemImageDisplay
                  imagePath={item.imageUrl}
                  altText={item.name}
                  sizes={`${orderImageSize}px`} // Pass the fixed size
                  // imageClassName="object-cover" is default
                />
              </div>
              
              <div className="flex-1 min-w-0"> {/* Added min-w-0 for better truncation */}
                <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.name}</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>
              <div className="text-right ml-2">
                <p className="text-xs sm:text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            <span>Total Amount:</span>
            <span className="text-emerald-600">${order.totalPrice.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500 text-right">
            Includes all taxes and fees where applicable.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" legacyBehavior>
            <a className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors duration-150 ease-in-out">
              Continue Shopping
            </a>
          </Link>
          {/* <Link href="/my-orders" legacyBehavior>
            <a className="block mt-4 text-sm text-emerald-600 hover:text-emerald-800 hover:underline">
                View My Orders
            </a>
          </Link> */}
        </div>

        <div className="mt-12 text-center text-xs text-gray-400">
            <p>If you have any questions, please contact support at support@awesomerestaurant.com.</p>
            <p>© {new Date().getFullYear()} The Awesome Restaurant. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}