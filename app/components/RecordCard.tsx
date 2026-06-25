"use client";
import { VinylRecord } from "../lib/data";
import { useCart } from "../lib/cart";
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
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="200" fill={bg} />
      <circle cx="100" cy="100" r="75" fill="#111" />
      <circle cx="100" cy="100" r="60" fill="#1a1a1a" />
      <circle cx="100" cy="100" r="45" fill="#222" />
      <circle cx="100" cy="100" r="30" fill="#333" />
      <circle cx="100" cy="100" r="20" fill={accent} opacity="0.9" />
      <circle cx="100" cy="100" r="6" fill="#111" />
      <text x="100" y="178" textAnchor="middle" fill="white" fontSize="11" fontFamily="sans-serif" opacity="0.8">
        {record.artist.substring(0, 20)}
      </text>
    </svg>
  );
}

export default function RecordCard({ record }: { record: VinylRecord }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col">
      <Link href={`/records/${record.id}`} className="block aspect-square bg-neutral-100 overflow-hidden">
        <VinylCover record={record} />
      </Link>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/records/${record.id}`} className="font-semibold text-neutral-900 hover:text-amber-600 transition-colors leading-tight">
              {record.title}
            </Link>
            <p className="text-sm text-neutral-500">{record.artist}</p>
          </div>
          <span className="text-lg font-bold text-amber-600 whitespace-nowrap">€{record.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">{record.genre}</span>
          <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">{record.year}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conditionColors[record.condition]}`}>
            {record.condition}
          </span>
        </div>
        <div className="mt-auto pt-2">
          {record.inStock ? (
            <button
              onClick={() => addToCart(record)}
              className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold py-2 rounded-lg transition-colors text-sm"
            >
              Add to Cart
            </button>
          ) : (
            <button disabled className="w-full bg-neutral-200 text-neutral-400 font-semibold py-2 rounded-lg text-sm cursor-not-allowed">
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
