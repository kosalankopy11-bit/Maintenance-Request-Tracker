import { useState } from "react";
import { Download, UploadCloud } from "lucide-react";
import api, { API_BASE_URL } from "../../services/api";

export default function ImportRequests() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const send = async (preview) => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post(`/import-csv?preview=${preview}`, form);
    setResult(data);
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><h1 className="text-2xl font-black">Import Requests</h1><p className="text-sm text-stone-500">Upload, preview, validate, and import maintenance tickets from CSV.</p></div>
        <a className="btn-secondary" href={`${API_BASE_URL}/import-csv/sample`}><Download size={16} />Sample CSV</a>
      </div>
      <div className="card space-y-5 p-6">
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-6"><UploadCloud className="text-mint" /><span><strong>Choose CSV file</strong><br /><span className="text-sm text-stone-500">{file?.name || "tenant_id,title,description,priority"}</span></span><input className="hidden" type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0])} /></label>
        <div className="flex gap-2"><button className="btn-secondary" disabled={!file} onClick={() => send(true)}>Preview CSV</button><button className="btn-primary" disabled={!file} onClick={() => send(false)}>Import Button</button></div>
      </div>
      {result && <div className="grid gap-5 lg:grid-cols-3"><div className="card p-5"><p className="text-sm text-stone-500">Imported rows</p><p className="mt-2 text-3xl font-black">{result.imported || 0}</p></div><div className="card p-5"><p className="text-sm text-stone-500">Failed rows</p><p className="mt-2 text-3xl font-black">{result.failed?.length || 0}</p></div><div className="card p-5"><p className="text-sm text-stone-500">Validation Errors</p><div className="mt-2 space-y-1 text-sm text-coral">{(result.errors || []).map((e) => <p key={e}>{e}</p>)}</div></div></div>}
      {result?.preview && <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-stone-50"><tr><th className="p-4">Tenant</th><th>Title</th><th>Description</th><th>Priority</th></tr></thead><tbody>{result.preview.map((row, idx) => <tr key={idx} className="border-t border-stone-100"><td className="p-4">{row.tenant_id || "Default"}</td><td>{row.title}</td><td>{row.description}</td><td>{row.priority}</td></tr>)}</tbody></table></div></div>}
    </div>
  );
}
