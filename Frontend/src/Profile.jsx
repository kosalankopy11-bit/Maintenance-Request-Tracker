import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../services/api";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const { register, handleSubmit, reset } = useForm();
  const passwordForm = useForm();
  useEffect(() => { api.get("/users/profile").then(({ data }) => { setProfile(data); reset(data); }); }, [reset]);
  const save = async (values) => {
    const { data } = await api.put("/users/profile", values);
    setProfile(data);
    alert("Profile updated");
  };
  const changePassword = async (values) => {
    await api.post("/users/change-password", values);
    passwordForm.reset();
    alert("Password changed");
  };
  if (!profile) return <div className="card p-8">Loading profile...</div>;
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div><h1 className="text-2xl font-black">Profile</h1><p className="text-sm text-stone-500">Edit profile details and profile picture URL.</p></div>
      <form onSubmit={handleSubmit(save)} className="card grid gap-4 p-6 sm:grid-cols-2">
        <label className="block text-sm font-semibold sm:col-span-2">Name<input className="input mt-1" {...register("name")} /></label>
        <label className="block text-sm font-semibold">Email<input className="input mt-1" value={profile.email} readOnly /></label>
        <label className="block text-sm font-semibold">Role<input className="input mt-1 capitalize" value={profile.role} readOnly /></label>
        {profile.role === "tenant" && <label className="block text-sm font-semibold sm:col-span-2">Phone<input className="input mt-1" {...register("phone")} /></label>}
        {profile.role === "staff" && <label className="block text-sm font-semibold sm:col-span-2">Department<input className="input mt-1" {...register("department")} /></label>}
        <label className="block text-sm font-semibold sm:col-span-2">Profile Picture<input className="input mt-1" {...register("profile_picture")} placeholder="https://..." /></label>
        <button className="btn-primary sm:col-span-2">Save profile</button>
      </form>
      <form onSubmit={passwordForm.handleSubmit(changePassword)} className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="text-lg font-black sm:col-span-2">Change Password</h2>
        <label className="block text-sm font-semibold">Current Password<input className="input mt-1" type="password" {...passwordForm.register("current_password", { required: true })} /></label>
        <label className="block text-sm font-semibold">New Password<input className="input mt-1" type="password" {...passwordForm.register("new_password", { required: true, minLength: 8 })} /></label>
        <button className="btn-secondary sm:col-span-2">Update password</button>
      </form>
    </div>
  );
}
