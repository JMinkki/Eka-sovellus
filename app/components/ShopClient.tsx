"use client";
import { useState, useMemo } from "react";
import { records } from "../lib/data";
import RecordCard from "./RecordCard";
import ShopFilters from "./ShopFilters";

export default function ShopClient() {
  const [genre, setGenre] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = [...records];
    if (genre !== "All") result = result.filter((r) => r.genre === genre);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) => r.title.toLowerCase().includes(q) || r.artist.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "year-desc": result.sort((a, b) => b.year - a.year); break;
      case "year-asc": result.sort((a, b) => a.year - b.year); break;
      case "artist": result.sort((a, b) => a.artist.localeCompare(b.artist)); break;
    }
    return result;
  }, [genre, sortBy, search]);

  return (
    <>
      <ShopFilters
        selectedGenre={genre}
        onGenreChange={setGenre}
        sortBy={sortBy}
        onSortChange={setSortBy}
        searchQuery={search}
        onSearchChange={setSearch}
      />
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">No records found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </>
  );
}
