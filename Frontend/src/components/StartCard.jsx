export default function StatCard({ title, value, icon: Icon, tone = "mint" }) {
  const colors = {
    mint: "bg-mint/10 text-mint",
    coral: "bg-coral/10 text-coral",
    gold: "bg-gold/20 text-amber-700",
    ink: "bg-ink/10 text-ink"
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-500">{title}</p>
          <p className="mt-2 text-3xl font-black">{value ?? 0}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-lg ${colors[tone]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
