export function date(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function statusColor(status) {
  return {
    Open: "bg-blue-50 text-blue-700",
    "In Progress": "bg-gold/20 text-amber-800",
    Resolved: "bg-emerald-50 text-emerald-700"
  }[status] || "bg-stone-100 text-stone-700";
}

export function priorityColor(priority) {
  return {
    Low: "bg-teal-50 text-teal-700",
    Medium: "bg-orange-50 text-orange-700",
    High: "bg-coral/15 text-coral"
  }[priority] || "bg-stone-100 text-stone-700";
}
