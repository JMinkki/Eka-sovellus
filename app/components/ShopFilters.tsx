"use client";
import { genres } from "../lib/data";

type Props = {
  selectedGenre: string;
  onGenreChange: (g: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
};

export default function ShopFilters({ selectedGenre, onGenreChange, sortBy, onSortChange, searchQuery, onSearchChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      <input
        type="text"
        placeholder="Search artist or title..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="border border-neutral-300 rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
      <select
        value={selectedGenre}
        onChange={(e) => onGenreChange(e.target.value)}
        className="border border-neutral-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
      >
        {genres.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="border border-neutral-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
      >
        <option value="default">Sort: Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="year-desc">Newest First</option>
        <option value="year-asc">Oldest First</option>
        <option value="artist">Artist A-Z</option>
      </select>
    </div>
  );
}
