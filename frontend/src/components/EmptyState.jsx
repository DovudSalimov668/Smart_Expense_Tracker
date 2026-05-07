export default function EmptyState({ title, message, action }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300/80 bg-white/[0.55] p-8 text-center dark:border-white/10 dark:bg-white/5">
      <div className="mx-auto mb-4 h-10 w-10 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/10" />
      <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
