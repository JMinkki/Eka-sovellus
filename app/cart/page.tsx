"use client";
import { useCart } from "../lib/cart";
import Link from "next/link";
import { XIcon, PlusIcon, MinusIcon } from "../components/Icons";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">&#9675;</div>
        <h2 className="text-2xl font-bold text-neutral-700 mb-2">Your cart is empty</h2>
        <p className="text-neutral-400 mb-8">Time to dig through some crates.</p>
        <Link href="/" className="bg-amber-400 hover:bg-amber-500 text-black font-bold px-8 py-3 rounded-xl transition-colors">
          Browse Records
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">Shopping Cart</h1>
      <div className="flex flex-col gap-4 mb-8">
        {items.map(({ record, quantity }) => (
          <div key={record.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-neutral-800 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl text-amber-400">
              &#9675;
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-neutral-900 truncate">{record.title}</p>
              <p className="text-sm text-neutral-500">{record.artist}</p>
              <p className="text-sm font-bold text-amber-600">€{record.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(record.id, quantity - 1)}
                className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => updateQuantity(record.id, quantity + 1)}
                className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="text-right ml-4">
              <p className="font-bold text-neutral-900">€{(record.price * quantity).toFixed(2)}</p>
            </div>
            <button
              onClick={() => removeFromCart(record.id)}
              className="ml-2 text-neutral-400 hover:text-red-500 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center text-lg font-semibold mb-4">
          <span>Total</span>
          <span className="text-2xl font-bold text-amber-600">€{totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={clearCart}
            className="flex-1 border border-neutral-300 text-neutral-600 font-semibold py-3 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            Clear Cart
          </button>
          <Link
            href="/checkout"
            className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-bold py-3 rounded-xl transition-colors text-center"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
