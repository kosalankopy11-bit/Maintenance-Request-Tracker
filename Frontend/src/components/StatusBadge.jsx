import { priorityColor, statusColor } from "../utils/format";

export function StatusBadge({ value }) {
  return <span className={`badge ${statusColor(value)}`}>{value}</span>;
}

export function PriorityBadge({ value }) {
  return <span className={`badge ${priorityColor(value)}`}>{value}</span>;
}
