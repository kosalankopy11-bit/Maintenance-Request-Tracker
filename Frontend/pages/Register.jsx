import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register: registerTenant } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const submit = async (values) => {
    setError("");
    try {
      await registerTenant(values);
      navigate("/tenant");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };
  return (
    <div className="grid min-h-screen place-items-center bg-[#f6f7f4] p-4">
      <div className="w-full max-w-lg card p-8">
        <h1 className="text-2xl font-black">Create tenant account</h1>
        <p className="mt-1 text-sm text-stone-500">Staff accounts are provisioned by administrators.</p>
        {error && <div className="mt-4 rounded-lg bg-coral/10 p-3 text-sm text-coral">{error}</div>}
        <form onSubmit={handleSubmit(submit)} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold sm:col-span-2">Name<input className="input mt-1" {...register("name", { required: true })} /></label>
          <label className="block text-sm font-semibold">Email<input className="input mt-1" type="email" {...register("email", { required: true })} /></label>
          <label className="block text-sm font-semibold">Phone<input className="input mt-1" {...register("phone")} /></label>
          <label className="block text-sm font-semibold sm:col-span-2">Password<input className="input mt-1" type="password" {...register("password", { required: true, minLength: 8 })} /></label>
          <button className="btn-primary sm:col-span-2" disabled={isSubmitting}>Create account</button>
        </form>
        <p className="mt-5 text-center text-sm text-stone-500">Already registered? <Link className="font-semibold text-mint" to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
