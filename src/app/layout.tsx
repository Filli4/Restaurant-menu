// src/app/layout.tsx (Example)
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
/* import { CartProvider } from "../../src/context/CartContext"; // Import the provider */
import Cart from "@/components/Cart"; // Import the Cart component
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
         
       {/*  <CartProvider> */}
          <Navbar /> {/* Wrap content with the provider */}
          <Cart /> {/* Render the Cart component so it's always visible */}
          <main> {/* Add padding if cart is fixed at top */}
            {children} {/* Your page content will go here */}
          </main>
        {/* </CartProvider> */}
      </body>
    </html>
  );
}