import ShopClient from "./components/ShopClient";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">Vinyl Records</h1>
        <p className="text-neutral-500 text-lg">Hand-curated classics, carefully graded and ready to spin.</p>
      </div>
      <ShopClient />
    </main>
  );
}
