import { BarChart3, ClipboardList, FileDown, FileUp, Home, PlusCircle, UserRound, Wrench } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const tenantLinks = [
  { to: "/tenant", label: "Dashboard", icon: Home },
  { to: "/tenant/new", label: "New Request", icon: PlusCircle },
  { to: "/tenant/requests", label: "My Requests", icon: ClipboardList }
];

const staffLinks = [
  { to: "/staff", label: "Dashboard", icon: Home },
  { to: "/staff/requests", label: "Manage Requests", icon: ClipboardList },
  { to: "/staff/import", label: "Import CSV", icon: FileUp },
  { to: "/staff/reports", label: "Reports", icon: BarChart3 },
  { to: "/staff/export", label: "Exports", icon: FileDown }
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const links = user?.role === "staff" ? staffLinks : tenantLinks;
  return (
    <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-30 w-72 border-r border-stone-200 bg-ink p-4 text-white transition lg:static lg:translate-x-0`}>
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-mint">
          <Wrench size={20} />
        </div>
        <div>
          <p className="text-lg font-black">MaintainHub</p>
          <p className="text-xs text-white/60">Maintenance operations</p>
        </div>
      </div>
      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-white text-ink" : "text-white/72 hover:bg-white/10 hover:text-white"}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        <NavLink to="/profile" onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/72 hover:bg-white/10 hover:text-white">
          <UserRound size={18} />
          Profile
        </NavLink>
      </nav>
    </aside>
  );
}
