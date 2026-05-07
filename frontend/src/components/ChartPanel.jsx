export default function ChartPanel({ title, children }) {
  return (
    <section className="panel reveal-up p-5">
      <div className="mb-4 flex items-center justify-between border-b border-slate-200/70 pb-3 dark:border-white/10">
        <h2 className="text-base font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h2>
        <span className="h-2 w-2 rounded-full bg-teal-500" />
      </div>
      <div className="h-72">{children}</div>
    </section>
  );
}
