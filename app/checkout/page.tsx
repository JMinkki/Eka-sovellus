"use client";
import { useCart } from "../lib/cart";
import { useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", address: "", city: "", zip: "", card: "", expiry: "", cvv: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearCart();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">&#10003;</div>
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">Order Confirmed!</h2>
        <p className="text-neutral-500 mb-8">Thank you for your order. Your records will ship within 2-3 business days.</p>
        <Link href="/" className="bg-amber-400 hover:bg-amber-500 text-black font-bold px-8 py-3 rounded-xl transition-colors">
          Back to Shop
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-neutral-700 mb-4">Nothing to checkout</h2>
        <Link href="/" className="bg-amber-400 hover:bg-amber-500 text-black font-bold px-8 py-3 rounded-xl transition-colors">
          Browse Records
        </Link>
      </div>
    );
  }

  const field = (name: keyof typeof form, label: string, placeholder: string, type = "text") => (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
      <input
        type={type}
        required
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">Checkout</h1>
      <div className="grid md:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="md:col-span-3 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Contact & Shipping</h2>
            <div className="grid gap-4">
              {field("name", "Full Name", "John Doe")}
              {field("email", "Email", "john@example.com", "email")}
              {field("address", "Address", "123 Main St")}
              <div className="grid grid-cols-2 gap-4">
                {field("city", "City", "Helsinki")}
                {field("zip", "ZIP Code", "00100")}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Payment</h2>
            <div className="grid gap-4">
              {field("card", "Card Number", "1234 5678 9012 3456")}
              <div className="grid grid-cols-2 gap-4">
                {field("expiry", "Expiry", "MM/YY")}
                {field("cvv", "CVV", "123")}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-amber-400 hover:bg-amber-500 text-black font-bold py-3.5 rounded-xl transition-colors text-lg"
          >
            Place Order — €{totalPrice.toFixed(2)}
          </button>
        </form>
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="flex flex-col gap-3 mb-4">
              {items.map(({ record, quantity }) => (
                <div key={record.id} className="flex justify-between text-sm">
                  <span className="text-neutral-600 truncate pr-2">{record.title} × {quantity}</span>
                  <span className="font-medium whitespace-nowrap">€{(record.price * quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-amber-600">€{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
