import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import EmptyState from "../../components/EmptyState";
import { PriorityBadge, StatusBadge } from "../../components/StatusBadge";
import { date } from "../../utils/format";

export default function MyRequests() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 10 });
  const [search, setSearch] = useState("");
  const load = (page = 1) => api.get("/requests/tenant", { params: { page, search } }).then(({ data }) => setData(data));
  useEffect(() => { load(1); }, []);
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><h1 className="text-2xl font-black">My Requests</h1><p className="text-sm text-stone-500">Search, inspect, and follow your maintenance tickets.</p></div>
        <div className="flex gap-2"><input className="input w-64" placeholder="Search title" value={search} onChange={(e) => setSearch(e.target.value)} /><button className="btn-secondary" onClick={() => load(1)}>Search</button></div>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500"><tr><th className="p-4">Request ID</th><th>Title</th><th>Priority</th><th>Status</th><th>Assigned Staff</th><th>Created Date</th><th>Actions</th></tr></thead>
            <tbody>{data.items.map((item) => <tr key={item.request_id} className="border-t border-stone-100"><td className="p-4 font-semibold">#{item.request_id}</td><td>{item.title}</td><td><PriorityBadge value={item.priority} /></td><td><StatusBadge value={item.status} /></td><td>{item.staff_name || "Unassigned"}</td><td>{date(item.created_at)}</td><td><Link className="btn-secondary px-2.5" to={`/tenant/requests/${item.request_id}`}><Eye size={16} /></Link></td></tr>)}</tbody>
          </table>
        </div>
        {!data.items.length && <EmptyState />}
        <div className="flex items-center justify-between border-t border-stone-100 p-4 text-sm text-stone-500">
          <span>{data.total} total requests</span>
          <div className="flex gap-2"><button className="btn-secondary" disabled={data.page <= 1} onClick={() => load(data.page - 1)}>Previous</button><button className="btn-secondary" disabled={data.page * data.page_size >= data.total} onClick={() => load(data.page + 1)}>Next</button></div>
        </div>
      </div>
    </div>
  );
}
