// app/order-success/[orderId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // storage is imported by ItemImageDisplay
import Link from 'next/link';
import ItemImageDisplay from '@/components/ItemImageDisplay'; // Import the reusable component

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string | null; // This will be the PATH from Firestore order document
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
              createdAt: data.createdAt,
              status: data.status || 'Unknown',
            } as OrderData);
          }
        } else {
          if (isMounted) setError('Order not found.');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to fetch order details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOrder();
    return () => { isMounted = false; };
  }, [orderId]);

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="ml-4 text-lg text-gray-700">Loading your order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700 mb-6">{error}</p>
        <Link href="/" legacyBehavior>
          <a className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
            Go to Homepage
          </a>
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-4 sm:p-8 text-center">
        <p className="text-gray-700">Order details could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto max-w-2xl p-4 sm:p-8 bg-white shadow-lg rounded-lg">
        <div className="text-center mb-8">
          <svg className="w-16 h-16 text-emerald-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h1 className="text-3xl font-bold text-gray-800">Thank You for Your Order!</h1>
          <p className="text-gray-600 mt-2">Your order has been placed successfully.</p>
        </div>

        <div className="border-t border-b border-gray-200 py-6 my-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Order ID:</span>
              <span className="font-medium text-gray-800">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Order Date:</span>
              <span className="font-medium text-gray-800">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Order Status:</span>
              <span className="font-medium capitalize px-2 py-0.5 rounded bg-blue-100 text-blue-700">{order.status}</span>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-700 mb-4">Items Ordered ({order.totalItems})</h3>
        <ul className="space-y-4 mb-6">
          {order.items.map((item: OrderItem) => (
            <li key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
              <ItemImageDisplay
                imagePath={item.imageUrl}
                itemName={item.name}
                size={70} // Desired size for order success page images
                // className="mr-0" // No extra margin needed if li has space-x-4
              />
              
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                <p className="font-semibold text-gray-800">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center text-lg font-semibold text-gray-800 mb-2">
            <span>Total Amount:</span>
            <span className="text-emerald-600">${order.totalPrice.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500 text-right">
            Includes all taxes and fees.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" legacyBehavior>
            <a className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
              Continue Shopping
            </a>
          </Link>
        </div>

        <div className="mt-12 text-center text-xs text-gray-400">
            <p>If you have any questions, please contact support at support@example.com.</p>
            <p>© {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}