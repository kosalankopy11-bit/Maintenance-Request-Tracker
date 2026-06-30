import api from "../services/api";

export async function downloadExport(format, filters = {}) {
  const params = { format };
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params[key] = value;
  });
  const response = await api.get("/export", { params, responseType: "blob" });
  const blob = new Blob([response.data], { type: format === "pdf" ? "application/pdf" : "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `maintainhub-requests.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
