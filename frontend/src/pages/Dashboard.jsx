import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { dashboardApi } from "../api/endpoints";
import ChartPanel from "../components/ChartPanel";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import TransactionTable from "../components/TransactionTable";
import { useAuth } from "../context/AuthContext";
import useAsync from "../hooks/useAsync";
import { formatCurrency } from "../utils/format";

export default function Dashboard() {
  const { profile } = useAuth();
  const currency = profile?.currency || "USD";
  const { data, loading, error } = useAsync(() => dashboardApi.get(), []);

  if (loading) return <LoadingSpinner label="Loading dashboard" />;
  if (error) return <EmptyState title="Dashboard unavailable" message={error} />;

  const totals = data?.totals || {};
  const categories = data?.category_breakdown || [];
  const trends = data?.monthly_trends || [];

  return (
    <>
      <PageHeader title="Dashboard" description="A refined view of balance, cashflow, recent activity, and budget pressure." />
      <section className="panel reveal-up mb-7 overflow-hidden p-5 md:p-7">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-stretch">
          <div>
            <p className="eyebrow">Live financial picture</p>
            <p className="headline-display mt-2 text-5xl text-slate-950 dark:text-white md:text-7xl">
              {formatCurrency(totals.balance, currency)}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              {formatCurrency(totals.monthly_income, currency)} in and {formatCurrency(totals.monthly_expenses, currency)} out this month.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-lg border border-slate-200/70 bg-white/70 px-4 py-2 text-sm dark:border-white/10 dark:bg-white/10">
                Monthly balance {formatCurrency(totals.monthly_balance, currency)}
              </div>
              <div className="rounded-lg border border-slate-200/70 bg-white/70 px-4 py-2 text-sm dark:border-white/10 dark:bg-white/10">
                Recent activity {(data?.recent_transactions || []).length} items
              </div>
            </div>
          </div>
          <div className="hero-mesh rounded-xl border border-slate-200/70 p-5 shadow-premium dark:border-white/10">
            <div className="grid h-full content-between gap-8">
              <div>
                <p className="eyebrow">This cycle</p>
                <h2 className="headline-display mt-2 text-2xl text-slate-950 dark:text-white">Cashflow snapshot</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-700 dark:text-slate-200">
                  A quick comparison of lifetime totals and this month’s operating balance.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-lg bg-white/[0.78] p-4 backdrop-blur dark:bg-black/20">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Income</p>
                  <p className="mt-2 text-xl font-semibold">{formatCurrency(totals.income, currency)}</p>
                </div>
                <div className="rounded-lg bg-white/[0.78] p-4 backdrop-blur dark:bg-black/20">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Expenses</p>
                  <p className="mt-2 text-xl font-semibold">{formatCurrency(totals.expenses, currency)}</p>
                </div>
                <div className="rounded-lg bg-white/[0.78] p-4 backdrop-blur dark:bg-black/20">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Month</p>
                  <p className="mt-2 text-xl font-semibold">{formatCurrency(totals.monthly_balance, currency)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total income" value={formatCurrency(totals.income, currency)} hint="All-time income tracked" accent="bg-emerald-500" />
        <StatCard title="Total expenses" value={formatCurrency(totals.expenses, currency)} hint="All-time expense tracked" accent="bg-rose-500" />
        <StatCard title="Current balance" value={formatCurrency(totals.balance, currency)} hint="Income minus expenses" accent="bg-sky-500" />
        <StatCard title="This month" value={formatCurrency(totals.monthly_balance, currency)} hint={`${formatCurrency(totals.monthly_expenses, currency)} spent`} accent="bg-violet-500" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartPanel title="Monthly spending by category">
          {categories.length ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categories} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                  {categories.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value, currency)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No expense data" message="Expenses added this month will appear here." />
          )}
        </ChartPanel>
        <ChartPanel title="Income vs expense trend">
          {trends.length ? (
            <ResponsiveContainer>
              <LineChart data={trends}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatCurrency(value, currency)} />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No trend yet" message="Add transactions across months to build a trend." />
          )}
        </ChartPanel>
      </div>
      <section className="panel reveal-up mt-6 p-6">
        <h2 className="mb-4 text-lg font-semibold">Recent transactions</h2>
        <TransactionTable transactions={data?.recent_transactions || []} currency={currency} />
      </section>
    </>
  );
}
