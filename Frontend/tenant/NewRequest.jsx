import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { UploadCloud } from "lucide-react";
import api from "../../services/api";

export default function NewRequest() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: { priority: "Medium" } });
  const submit = async (values) => {
    setError("");
    try {
      let attachment = null;
      if (values.file?.[0]) {
        const form = new FormData();
        form.append("file", values.file[0]);
        const upload = await api.post("/upload", form);
        attachment = upload.data.filename;
      }
      const { data } = await api.post("/requests", { title: values.title, description: values.description, priority: values.priority, attachment });
      navigate(`/tenant/requests/${data.request_id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not submit request");
    }
  };
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div><h1 className="text-2xl font-black">Submit Maintenance Request</h1><p className="text-sm text-stone-500">Attach a photo or PDF to help staff diagnose the issue faster.</p></div>
      <form onSubmit={handleSubmit(submit)} className="card space-y-5 p-6">
        {error && <div className="rounded-lg bg-coral/10 p-3 text-sm text-coral">{error}</div>}
        <label className="block text-sm font-semibold">Title<input className="input mt-1" {...register("title", { required: true })} /></label>
        <label className="block text-sm font-semibold">Description<textarea className="input mt-1 min-h-36" {...register("description", { required: true, minLength: 10 })} /></label>
        <label className="block text-sm font-semibold">Priority<select className="input mt-1" {...register("priority")}><option>Low</option><option>Medium</option><option>High</option></select></label>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-5 text-sm">
          <UploadCloud className="text-mint" />
          <span><strong>Upload attachment</strong><br /><span className="text-stone-500">jpg, png, or pdf</span></span>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" {...register("file")} />
        </label>
        <button className="btn-primary" disabled={isSubmitting}>Submit request</button>
      </form>
    </div>
  );
}
