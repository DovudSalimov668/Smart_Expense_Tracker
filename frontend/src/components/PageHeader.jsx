export default function PageHeader({ title, description, action }) {
  return (
    <div className="reveal-up mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow mb-2">Smart Expense Tracker</p>
        <h1 className="headline-display text-3xl text-slate-950 dark:text-white md:text-5xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-2 sm:justify-end">{action}</div> : null}
    </div>
  );
}
