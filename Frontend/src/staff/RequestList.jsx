import { useEffect, useState } from "react";
import { Eye, FileDown, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import EmptyState from "../../components/EmptyState";
import { PriorityBadge, StatusBadge } from "../../components/StatusBadge";
import { date } from "../../utils/format";
import { downloadExport } from "../../utils/download";

export default function RequestList() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 10 });
  const [staff, setStaff] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", assigned_staff: "", sort: "created_at", direction: "desc" });
  const load = (page = 1) => api.get("/requests", { params: { page, ...filters, assigned_staff: filters.assigned_staff || undefined } }).then(({ data }) => setData(data));
  useEffect(() => { api.get("/staff").then(({ data }) => setStaff(data)); load(1); }, []);
  const updateStatus = async (id, status) => { await api.post(`/requests/${id}/status`, { status }); load(data.page); };
  const assign = async (id, staffId) => { if (staffId) { await api.post(`/requests/${id}/assign`, { staff_id: Number(staffId) }); load(data.page); } };
  const remove = async (id) => { if (confirm("Delete this request?")) { await api.delete(`/requests/${id}`); load(data.page); } };
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div><h1 className="text-2xl font-black">Manage Requests</h1><p className="text-sm text-stone-500">Filter, assign, progress, export, and audit maintenance work.</p></div>
        <div className="flex gap-2"><button className="btn-secondary" onClick={() => downloadExport("csv", filters)}><FileDown size={16} />CSV</button><button className="btn-secondary" onClick={() => downloadExport("pdf", filters)}><FileDown size={16} />PDF</button></div>
      </div>
      <div className="card grid gap-3 p-4 md:grid-cols-6">
        <input className="input md:col-span-2" placeholder="Search title" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option><option>Open</option><option>In Progress</option><option>Resolved</option></select>
        <select className="input" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}><option value="">All priorities</option><option>Low</option><option>Medium</option><option>High</option></select>
        <select className="input" value={filters.assigned_staff} onChange={(e) => setFilters({ ...filters, assigned_staff: e.target.value })}><option value="">Any staff</option>{staff.map((s) => <option key={s.staff_id} value={s.staff_id}>{s.name}</option>)}</select>
        <button className="btn-primary" onClick={() => load(1)}>Apply</button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500"><tr><th className="p-4">ID</th><th>Title</th><th>Priority</th><th>Status</th><th>Tenant</th><th>Assigned Staff</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>{data.items.map((item) => <tr key={item.request_id} className="border-t border-stone-100"><td className="p-4 font-semibold">#{item.request_id}</td><td>{item.title}</td><td><PriorityBadge value={item.priority} /></td><td><StatusBadge value={item.status} /></td><td>{item.tenant_name}</td><td><select className="input" value={item.staff_id || ""} onChange={(e) => assign(item.request_id, e.target.value)}><option value="">Unassigned</option>{staff.map((s) => <option key={s.staff_id} value={s.staff_id}>{s.name}</option>)}</select></td><td>{date(item.created_at)}</td><td><div className="flex gap-2"><select className="input w-36" value={item.status} onChange={(e) => updateStatus(item.request_id, e.target.value)}><option>Open</option><option>In Progress</option><option>Resolved</option></select><Link className="btn-secondary px-2.5" to={`/staff/requests/${item.request_id}`}><Eye size={16} /></Link><button className="btn-secondary px-2.5 text-coral" onClick={() => remove(item.request_id)}><Trash2 size={16} /></button></div></td></tr>)}</tbody>
          </table>
        </div>
        {!data.items.length && <EmptyState />}
        <div className="flex items-center justify-between border-t border-stone-100 p-4 text-sm text-stone-500"><span>{data.total} matching requests</span><div className="flex gap-2"><button className="btn-secondary" disabled={data.page <= 1} onClick={() => load(data.page - 1)}>Previous</button><button className="btn-secondary" disabled={data.page * data.page_size >= data.total} onClick={() => load(data.page + 1)}>Next</button></div></div>
      </div>
    </div>
  );
}
