import { Bell, LogOut, Menu, Search, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-200 bg-white/85 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <button className="btn-secondary px-2.5 lg:hidden" onClick={onMenu} aria-label="Open navigation">
          <Menu size={18} />
        </button>
        <div className="hidden items-center rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 md:flex">
          <Search size={16} className="text-stone-400" />
          <input className="ml-2 w-72 bg-transparent text-sm outline-none" placeholder="Search requests, people, reports" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn-secondary px-2.5" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <a className="btn-secondary px-2.5" href="/profile" aria-label="Profile">
          <UserRound size={18} />
        </a>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="text-xs capitalize text-stone-500">{user?.role}</p>
        </div>
        <button className="btn-secondary px-2.5" onClick={logout} aria-label="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
