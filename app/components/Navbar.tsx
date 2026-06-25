"use client";
import Link from "next/link";
import { useCart } from "../lib/cart";
import { ShoppingCartIcon } from "./Icons";

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <nav className="bg-neutral-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-amber-400">&#9675;</span>
            <span>VinylVault</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-amber-400 transition-colors text-sm font-medium">
              Shop
            </Link>
            <Link href="/cart" className="relative flex items-center gap-1 hover:text-amber-400 transition-colors text-sm font-medium">
              <ShoppingCartIcon className="w-5 h-5" />
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 bg-amber-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
