import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { dashboardApi } from "../api/endpoints";
import ChartPanel from "../components/ChartPanel";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import useAsync from "../hooks/useAsync";
import { formatCurrency } from "../utils/format";

export default function Analytics() {
  const { profile } = useAuth();
  const currency = profile?.currency || "USD";
  const { data, loading, error } = useAsync(() => dashboardApi.get(), []);

  if (loading) return <LoadingSpinner label="Loading analytics" />;
  if (error) return <EmptyState title="Analytics unavailable" message={error} />;

  const categories = data?.category_breakdown || [];
  const trends = data?.monthly_trends || [];
  const totals = data?.totals || {};

  return (
    <>
      <PageHeader title="Analytics" description="Category mix, spending movement, and income compared with expenses." />
      <section className="panel reveal-up mb-6 overflow-hidden p-5 md:p-7">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="eyebrow">Pattern recognition</p>
            <h2 className="headline-display mt-2 text-4xl text-slate-950 dark:text-white md:text-6xl">
              Spending shifts, clearly.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Category mix and monthly movement are grouped for fast comparison without leaving the dashboard flow.
            </p>
          </div>
          <div className="hero-mesh min-h-44 rounded-xl border border-slate-200/70 p-5 shadow-premium dark:border-white/10" />
        </div>
      </section>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard title="Monthly income" value={formatCurrency(totals.monthly_income, currency)} accent="bg-emerald-500" />
        <StatCard title="Monthly expenses" value={formatCurrency(totals.monthly_expenses, currency)} accent="bg-rose-500" />
        <StatCard title="Monthly balance" value={formatCurrency(totals.monthly_balance, currency)} accent="bg-sky-500" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel title="Spending overview">
          {categories.length ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categories} dataKey="value" nameKey="name" outerRadius={100} label>
                  {categories.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value, currency)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No category data" message="Add expenses to populate the category pie chart." />
          )}
        </ChartPanel>
        <ChartPanel title="Income vs expense">
          {trends.length ? (
            <ResponsiveContainer>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatCurrency(value, currency)} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No trend data" message="Transactions across months will build this chart." />
          )}
        </ChartPanel>
      </div>
      <section className="panel reveal-up mt-6 p-6">
        <h2 className="mb-4 text-lg font-semibold">Category totals</h2>
        {categories.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <div key={category.name} className="rounded-lg border border-slate-200/80 bg-white/[0.62] p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <p className="font-semibold">{category.name}</p>
                </div>
                <p className="mt-3 text-xl font-bold">{formatCurrency(category.value, currency)}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No spending yet" message="Expense categories will be summarized here." />
        )}
      </section>
    </>
  );
}
