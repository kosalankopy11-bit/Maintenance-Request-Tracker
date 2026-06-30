import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Wrench } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: { email: "staff@maintainhub.com", password: "Admin@123" } });
  const submit = async (values) => {
    setError("");
    try {
      const user = await login(values);
      navigate(user.role === "staff" ? "/staff" : "/tenant");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };
  return (
    <div className="grid min-h-screen place-items-center bg-[#f6f7f4] p-4">
      <div className="w-full max-w-md card p-8">
        <div className="mb-7 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-mint text-white"><Wrench /></div>
          <div><h1 className="text-2xl font-black">MaintainHub</h1><p className="text-sm text-stone-500">Sign in to your workspace</p></div>
        </div>
        {error && <div className="mb-4 rounded-lg bg-coral/10 p-3 text-sm text-coral">{error}</div>}
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <label className="block text-sm font-semibold">Email<input className="input mt-1" type="email" {...register("email", { required: true })} /></label>
          <label className="block text-sm font-semibold">Password<input className="input mt-1" type="password" {...register("password", { required: true })} /></label>
          <button className="btn-primary w-full" disabled={isSubmitting}>Sign in</button>
        </form>
        <p className="mt-5 text-center text-sm text-stone-500">Tenant? <Link className="font-semibold text-mint" to="/register">Create an account</Link></p>
      </div>
    </div>
  );
}
