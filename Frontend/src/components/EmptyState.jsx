import { ClipboardList } from "lucide-react";

export default function EmptyState({ title = "No records found", text = "Try changing filters or creating a new request." }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center">
      <ClipboardList className="mx-auto text-stone-400" size={34} />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-stone-500">{text}</p>
    </div>
  );
}
