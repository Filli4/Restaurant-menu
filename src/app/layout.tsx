// src/app/layout.tsx 
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Cart from "@/components/Cart"; 
import Navbar from "@/components/Navbar";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Restaurant",
  description: "Delicious food awaits!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
         
       
          <Navbar /> 
          <Cart /> 
          <main> 
            {children} 
          </main>
       
      </body>
    </html>
  );
}