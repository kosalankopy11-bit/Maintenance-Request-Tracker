import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, ClipboardList, FileDown } from "lucide-react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
import RequestCard from "../../components/RequestCard";
import { downloadExport } from "../../utils/download";

export default function StaffDashboard() {
  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState(null);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    api.get("/requests?page_size=6").then(({ data }) => setRequests(data.items));
    api.get("/reports/summary").then(({ data }) => setSummary(data));
    api.get("/notifications").then(({ data }) => setNotifications(data));
  }, []);
  const count = (status) => summary?.status_distribution?.[status] || 0;
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div><h1 className="text-3xl font-black">Staff Admin Dashboard</h1><p className="text-sm text-stone-500">Operational overview for incoming and active maintenance work.</p></div>
        <div className="flex gap-2"><button className="btn-secondary" onClick={() => downloadExport("csv")}><FileDown size={16} />CSV</button><button className="btn-secondary" onClick={() => downloadExport("pdf")}><FileDown size={16} />PDF</button></div>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="Total Requests" value={summary?.request_count} icon={ClipboardList} />
        <StatCard title="Open" value={count("Open")} icon={Clock3} tone="gold" />
        <StatCard title="In Progress" value={count("In Progress")} icon={ClipboardList} tone="coral" />
        <StatCard title="Resolved" value={summary?.resolved} icon={CheckCircle2} tone="ink" />
        <StatCard title="High Priority" value={summary?.priority_distribution?.High || 0} icon={AlertTriangle} tone="coral" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section><h2 className="mb-3 text-lg font-black">Recent Requests</h2><div className="grid gap-3 md:grid-cols-2">{requests.map((item) => <RequestCard key={item.request_id} request={item} basePath="/staff/requests" />)}</div></section>
        <aside className="space-y-4"><div className="card p-5"><h2 className="font-black">Notifications</h2><div className="mt-3 space-y-3">{notifications.length === 0 && <p className="text-sm text-stone-500">No notifications yet.</p>}{notifications.slice(0, 5).map((item) => <div key={item.notification_id} className="rounded-lg bg-stone-50 p-3"><p className="text-sm font-semibold">{item.title}</p><p className="text-xs text-stone-500">{item.message}</p></div>)}</div></div><div className="card p-5"><h2 className="font-black">Activity Feed</h2><div className="mt-3 space-y-3 text-sm text-stone-600">{summary?.recent_activity?.map((a) => <p key={a.history_id}>Request #{a.request_id} moved to <strong>{a.status}</strong></p>)}</div></div></aside>
      </div>
    </div>
  );
}
