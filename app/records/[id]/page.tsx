import { records } from "../../lib/data";
import { notFound } from "next/navigation";
import RecordDetail from "./RecordDetail";

export function generateStaticParams() {
  return records.map((r) => ({ id: String(r.id) }));
}

export default async function RecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = records.find((r) => r.id === Number(id));
  if (!record) notFound();
  return <RecordDetail record={record} />;
}
