import { FileDown } from "lucide-react";
import { useState } from "react";
import { downloadExport } from "../../utils/download";

export default function ExportCenter() {
  const [filters, setFilters] = useState({ status: "", priority: "", date_from: "", date_to: "" });
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div><h1 className="text-2xl font-black">Export Requests</h1><p className="text-sm text-stone-500">Export all requests, filtered requests, or a date range to CSV/PDF.</p></div>
      <div className="card grid gap-4 p-6 sm:grid-cols-2">
        <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option><option>Open</option><option>In Progress</option><option>Resolved</option></select>
        <select className="input" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}><option value="">All priorities</option><option>Low</option><option>Medium</option><option>High</option></select>
        <input className="input" type="datetime-local" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} />
        <input className="input" type="datetime-local" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} />
        <button className="btn-secondary" onClick={() => downloadExport("csv", filters)}><FileDown size={16} />Generate CSV</button>
        <button className="btn-primary" onClick={() => downloadExport("pdf", filters)}><FileDown size={16} />Generate PDF</button>
      </div>
    </div>
  );
}
