import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./lib/cart";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VinylVault — Vinyl Records Shop",
  description: "Hand-curated vinyl records, carefully graded and ready to spin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-neutral-50">
        <CartProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <footer className="bg-neutral-900 text-neutral-400 text-sm py-6 text-center mt-10">
            © {new Date().getFullYear()} VinylVault. All records are final sale.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
