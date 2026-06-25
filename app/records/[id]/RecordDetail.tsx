"use client";
import { VinylRecord } from "../../lib/data";
import { useCart } from "../../lib/cart";
import Link from "next/link";

const conditionColors: { [key: string]: string } = {
  Mint: "bg-green-100 text-green-800",
  "Near Mint": "bg-emerald-100 text-emerald-800",
  "Very Good Plus": "bg-blue-100 text-blue-800",
  "Very Good": "bg-yellow-100 text-yellow-800",
  Good: "bg-orange-100 text-orange-800",
};

const coverColors = [
  ["#1a1a2e", "#e94560"],
  ["#0f3460", "#533483"],
  ["#16213e", "#0f3460"],
  ["#2d6a4f", "#1b4332"],
  ["#6b2737", "#9b2335"],
  ["#4a1942", "#c77dff"],
  ["#1d3557", "#457b9d"],
  ["#333333", "#e63946"],
];

function VinylCover({ record }: { record: VinylRecord }) {
  const [bg, accent] = coverColors[record.id % coverColors.length];
  return (
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="400" fill={bg} />
      <circle cx="200" cy="200" r="150" fill="#111" />
      <circle cx="200" cy="200" r="130" fill="#1a1a1a" />
      <circle cx="200" cy="200" r="100" fill="#222" />
      <circle cx="200" cy="200" r="70" fill="#2a2a2a" />
      <circle cx="200" cy="200" r="45" fill="#333" />
      <circle cx="200" cy="200" r="32" fill={accent} opacity="0.9" />
      <circle cx="200" cy="200" r="10" fill="#111" />
      <text x="200" y="375" textAnchor="middle" fill="white" fontSize="18" fontFamily="sans-serif" opacity="0.8">
        {record.artist}
      </text>
    </svg>
  );
}

export default function RecordDetail({ record }: { record: VinylRecord }) {
  const { addToCart } = useCart();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/" className="text-sm text-neutral-500 hover:text-amber-600 transition-colors mb-6 inline-block">
        ← Back to shop
      </Link>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 shadow-lg">
          <VinylCover record={record} />
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{record.title}</h1>
            <p className="text-xl text-neutral-500 mt-1">{record.artist}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full">{record.genre}</span>
            <span className="text-xs px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full">{record.year}</span>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${conditionColors[record.condition]}`}>
              {record.condition}
            </span>
          </div>
          <p className="text-neutral-600 leading-relaxed">{record.description}</p>
          <div className="mt-auto">
            <div className="text-4xl font-bold text-amber-600 mb-4">€{record.price.toFixed(2)}</div>
            {record.inStock ? (
              <button
                onClick={() => addToCart(record)}
                className="w-full bg-amber-400 hover:bg-amber-500 text-black font-bold py-3 rounded-xl transition-colors text-lg"
              >
                Add to Cart
              </button>
            ) : (
              <button disabled className="w-full bg-neutral-200 text-neutral-400 font-bold py-3 rounded-xl text-lg cursor-not-allowed">
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
