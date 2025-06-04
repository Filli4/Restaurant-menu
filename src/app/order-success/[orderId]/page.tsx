// app/order-success/[orderId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase'; 
import Link from 'next/link';
import ItemImageDisplay from '@/components/ItemImageDisplay'; 
import CelebrationOverlay from '@/components/CelebrationOverlay'; 
import Ordernotfound from '@/components/Ordernotfound'; 

// ... (rest of the interfaces OrderItem, OrderData remain the same) ...
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string | null;
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
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided. Please ensure you have a valid order link.");
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
              createdAt: data.createdAt as Timestamp,
              status: data.status || 'Unknown',
            } as OrderData);
            setShowCelebration(true);
          }
        } else {
          if (isMounted) setError('Order not found. Please check the ID or contact support if the issue persists.');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        if (isMounted) setError(err instanceof Error ? err.message : 'An unexpected error occurred while fetching your order details. Please try again later.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrder();

    return () => { 
      isMounted = false; 
    };
  }, [orderId]);

  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp || !(timestamp instanceof Timestamp)) return 'N/A';
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
    let errorTitle = "Error Loading Order";
    if (error.includes("No order ID provided")) {
      errorTitle = "Invalid Order Link";
    } else if (error.includes("Order not found")) {
      errorTitle = "Order Not Found"; // This title makes sense if using 'Ordernotfound' component name
    }

    return (
      <Ordernotfound // UPDATED COMPONENT USAGE
        title={errorTitle}
        errorMessage={error}
      />
    );
  }

  if (!order) {
    return (
      <Ordernotfound // UPDATED COMPONENT USAGE
        title="Order Unavailable"
        errorMessage="Order details could not be loaded at this time. Please try returning to the homepage."
      />
    );
  }

  const orderImageSize = 70;

  return (
    <>
      <CelebrationOverlay show={showCelebration} />
      
      <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
        <div className="container mx-auto max-w-2xl p-4 sm:p-6 md:p-8 bg-white shadow-xl rounded-lg">
          {/* ... rest of your successful order display JSX ... */}
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
                <div
                  className="flex-shrink-0 rounded-md overflow-hidden relative bg-gray-100"
                  style={{ width: `${orderImageSize}px`, height: `${orderImageSize}px` }}
                >
                  <ItemImageDisplay
                    imagePath={item.imageUrl}
                    altText={item.name}
                    sizes={`${orderImageSize}px`}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
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
          </div>

          <div className="mt-12 text-center text-xs text-gray-400">
              <p>If you have any questions, please contact support at support@awesomerestaurant.com.</p>
              <p>© {new Date().getFullYear()} The Awesome Restaurant. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
}