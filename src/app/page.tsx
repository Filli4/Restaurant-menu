// src/app/page.tsx
import dynamic from 'next/dynamic';
import { useState } from 'react';

export const metadata = {
  title: 'SmakMeny | The Awesome Restaurant',
  description: 'Browse our complete menu of appetizers, main courses, and desserts.',
  openGraph: {
    title: 'Our SmakMeny - The Awesome Restaurant',
    description: 'Appetizers, main courses, desserts & drinks. Made fresh daily.',
    url: 'https://filmonelias.com/menu',
    siteName: 'The Awesome Restaurant',
    images: [
      {
        url: 'https://cdn.langeek.co/photo/26033/original/many?type=png',
        width: 1200,
        height: 630,
        alt: 'Our Menu',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

const MenuClientPage = dynamic(() => import('./../components/Menu'), { 
  ssr: false,
  loading: () => (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8 flex flex-col items-center justify-center text-center">
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
  )
});

// Your Page component becomes extremely simple
export default function Page() {
  return <MenuClientPage />;
}