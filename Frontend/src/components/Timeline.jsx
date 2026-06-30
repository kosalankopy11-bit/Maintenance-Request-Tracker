import { date } from "../utils/format";

export default function Timeline({ items = [] }) {
  if (!items.length) return <div className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">No status history yet.</div>;
  return (
    <div className="space-y-5">
      {items.map((item) => (
        <div key={item.history_id} className="relative border-l-2 border-mint/30 pl-5">
          <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-mint" />
          <p className="font-semibold">{item.previous_status || "Created"} to {item.status}</p>
          <p className="text-sm text-stone-500">{item.staff_name || "System"} • {date(item.changed_at)}</p>
        </div>
      ))}
    </div>
  );
}
