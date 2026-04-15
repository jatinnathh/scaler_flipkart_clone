import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Flipkart Clone — Online Shopping India",
  description:
    "India's leading e-commerce platform. Shop electronics, fashion, home & kitchen, books, and more at the best prices with fast delivery.",
  keywords: "flipkart, online shopping, electronics, fashion, india",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable}`}>
        <head>
          <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        </head>
        <body className="min-h-screen bg-flipkart-bg font-sans antialiased">
          <ToastProvider>
            <CartProvider>{children}</CartProvider>
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
