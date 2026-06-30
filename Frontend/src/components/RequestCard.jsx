import { Link } from "react-router-dom";
import { PriorityBadge, StatusBadge } from "./StatusBadge";
import { date } from "../utils/format";

export default function RequestCard({ request, basePath }) {
  return (
    <Link to={`${basePath}/${request.request_id}`} className="card block p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{request.title}</p>
          <p className="mt-1 text-xs text-stone-500">#{request.request_id} • {date(request.created_at)}</p>
        </div>
        <StatusBadge value={request.status} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <PriorityBadge value={request.priority} />
        <span className="text-sm text-stone-500">{request.staff_name || "Unassigned"}</span>
      </div>
    </Link>
  );
}
