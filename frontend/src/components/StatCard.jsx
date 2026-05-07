export default function StatCard({ title, value, hint, accent = "bg-slate-950" }) {
  return (
    <div className="panel reveal-up overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-premium">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-[1.9rem]">{value}</p>
        </div>
        <span className={`h-10 w-10 rounded-lg ${accent} opacity-90 shadow-sm`} />
      </div>
      {hint ? <p className="mt-4 border-t border-slate-200/70 pt-3 text-xs leading-5 text-slate-500 dark:border-white/10 dark:text-slate-400">{hint}</p> : null}
    </div>
  );
}
