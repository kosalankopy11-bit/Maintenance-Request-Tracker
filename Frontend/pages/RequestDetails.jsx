import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useParams } from "react-router-dom";
import api, { uploadUrl } from "../services/api";
import CommentBox from "../components/CommentBox";
import Timeline from "../components/Timeline";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import { date } from "../utils/format";
import { useAuth } from "../context/AuthContext";

export default function RequestDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const load = async () => {
    const [req, hist, comm] = await Promise.all([api.get(`/requests/${id}`), api.get(`/requests/${id}/history`), api.get(`/requests/${id}/comments`)]);
    setRequest(req.data); setHistory(hist.data); setComments(comm.data);
  };
  useEffect(() => { load(); }, [id]);
  const addComment = async (comment) => {
    await api.post(`/requests/${id}/comments`, { comment });
    await load();
  };
  if (!request) return <div className="card p-8 text-sm text-stone-500">Loading request details...</div>;
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div><p className="text-sm font-semibold text-mint">Request #{request.request_id}</p><h1 className="mt-1 text-3xl font-black">{request.title}</h1><p className="mt-2 text-sm text-stone-500">Created {date(request.created_at)} by {request.tenant_name}</p></div>
        <div className="flex gap-2"><PriorityBadge value={request.priority} /><StatusBadge value={request.status} /></div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <div className="card p-6"><h2 className="font-black">Description</h2><p className="mt-3 leading-7 text-stone-700">{request.description}</p>{request.attachment && <a className="btn-secondary mt-5" href={uploadUrl(request.attachment)} target="_blank"><Download size={16} />View attachment</a>}</div>
          <div className="card p-6"><h2 className="mb-4 font-black">Comments</h2><CommentBox comments={comments} onSubmit={addComment} /></div>
        </section>
        <aside className="space-y-5">
          <div className="card p-6"><h2 className="font-black">Assignment</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-stone-500">Assigned staff</dt><dd className="font-semibold">{request.staff_name || "Unassigned"}</dd></div><div className="flex justify-between"><dt className="text-stone-500">Current status</dt><dd><StatusBadge value={request.status} /></dd></div><div className="flex justify-between"><dt className="text-stone-500">Role</dt><dd className="capitalize">{user?.role}</dd></div></dl></div>
          <div className="card p-6"><h2 className="mb-4 font-black">Status Timeline</h2><Timeline items={history} /></div>
        </aside>
      </div>
    </div>
  );
}
