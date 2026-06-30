import { useEffect, useState } from "react";
import { CheckCircle2, Clock, FileDown, PieChart, Wrench } from "lucide-react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
import { date } from "../../utils/format";
import { downloadExport } from "../../utils/download";

function Bar({ label, value, total }) {
  const width = total ? Math.round((value / total) * 100) : 0;
  return <div><div className="mb-1 flex justify-between text-sm"><span>{label}</span><strong>{value}</strong></div><div className="h-2 rounded-full bg-stone-100"><div className="h-2 rounded-full bg-mint" style={{ width: `${width}%` }} /></div></div>;
}

export default function Reports() {
  const [summary, setSummary] = useState(null);
  useEffect(() => { api.get("/reports/summary").then(({ data }) => setSummary(data)); }, []);
  const total = summary?.request_count || 0;
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h1 className="text-2xl font-black">Reports Dashboard</h1><p className="text-sm text-stone-500">Distribution, resolution speed, and recent workflow activity.</p></div><div className="flex gap-2"><button className="btn-secondary" onClick={() => downloadExport("csv")}><FileDown size={16} />Export CSV</button><button className="btn-secondary" onClick={() => downloadExport("pdf")}><FileDown size={16} />Export PDF</button></div></div>
      <div className="grid gap-4 md:grid-cols-4"><StatCard title="Request Count" value={total} icon={Wrench} /><StatCard title="Open" value={summary?.open} icon={Clock} tone="gold" /><StatCard title="Resolved" value={summary?.resolved} icon={CheckCircle2} tone="ink" /><StatCard title="Avg Resolution Time" value={`${summary?.average_resolution_hours || 0}h`} icon={PieChart} tone="coral" /></div>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-6"><h2 className="mb-4 font-black">Priority Distribution</h2><div className="space-y-4">{Object.entries(summary?.priority_distribution || {}).map(([k, v]) => <Bar key={k} label={k} value={v} total={total} />)}</div></section>
        <section className="card p-6"><h2 className="mb-4 font-black">Status Distribution</h2><div className="space-y-4">{Object.entries(summary?.status_distribution || {}).map(([k, v]) => <Bar key={k} label={k} value={v} total={total} />)}</div></section>
      </div>
      <section className="card p-6"><h2 className="mb-4 font-black">Recent Activity</h2><div className="space-y-3">{summary?.recent_activity?.map((item) => <p key={item.history_id} className="rounded-lg bg-stone-50 p-3 text-sm">Request #{item.request_id} changed from {item.previous_status || "Created"} to <strong>{item.status}</strong> by {item.staff_name || "System"} on {date(item.changed_at)}</p>)}</div></section>
    </div>
  );
}
