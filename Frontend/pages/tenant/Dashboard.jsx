import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, ClipboardList, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";
import RequestCard from "../../components/RequestCard";

export default function TenantDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    api.get("/requests/tenant?page_size=5").then(({ data }) => setRequests(data.items));
    api.get("/notifications").then(({ data }) => setNotifications(data));
  }, []);
  const count = (status) => requests.filter((item) => item.status === status).length;
  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-ink p-6 text-white shadow-soft">
        <p className="text-sm text-white/70">Welcome back</p>
        <h1 className="mt-2 text-3xl font-black">{user?.name}</h1>
        <p className="mt-2 max-w-2xl text-white/70">Track repair work, add details for staff, and follow updates from open to resolved.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Requests" value={requests.length} icon={ClipboardList} />
        <StatCard title="Open Requests" value={count("Open")} icon={Clock3} tone="gold" />
        <StatCard title="In Progress" value={count("In Progress")} icon={ClipboardList} tone="coral" />
        <StatCard title="Resolved" value={count("Resolved")} icon={CheckCircle2} tone="ink" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-3">
          <div className="flex items-center justify-between"><h2 className="text-lg font-black">Recent Requests</h2><Link className="text-sm font-semibold text-mint" to="/tenant/requests">View all</Link></div>
          <div className="grid gap-3 md:grid-cols-2">{requests.map((item) => <RequestCard key={item.request_id} request={item} basePath="/tenant/requests" />)}</div>
        </section>
        <aside className="space-y-4">
          <div className="card p-5"><h2 className="font-black">Quick Actions</h2><Link className="btn-primary mt-4 w-full" to="/tenant/new"><PlusCircle size={16} />Submit request</Link></div>
          <div className="card p-5"><h2 className="font-black">Notifications</h2><div className="mt-3 space-y-3">{notifications.length === 0 && <p className="text-sm text-stone-500">No notifications yet.</p>}{notifications.slice(0, 5).map((item) => <div key={item.notification_id} className="rounded-lg bg-stone-50 p-3"><p className="text-sm font-semibold">{item.title}</p><p className="text-xs text-stone-500">{item.message}</p></div>)}</div></div>
        </aside>
      </div>
    </div>
  );
}
