import { Edit2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { budgetApi, categoryApi } from "../api/endpoints";
import BudgetForm from "../components/BudgetForm";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { formatApiError, formatCurrency, monthInputValue } from "../utils/format";

const statusStyles = {
  healthy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  exceeded: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

export default function Budgets() {
  const { profile } = useAuth();
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [month, setMonth] = useState(monthInputValue());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [categoryResponse, budgetResponse] = await Promise.all([
        categoryApi.list({ type: "expense" }),
        budgetApi.list({ month }),
      ]);
      setCategories(categoryResponse.data.results || categoryResponse.data);
      setBudgets(budgetResponse.data.results || budgetResponse.data);
    } catch (error) {
      toast.error(formatApiError(error, "Could not load budgets"));
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const saveBudget = async (payload) => {
    setSaving(true);
    try {
      if (modal?.budget) {
        await budgetApi.update(modal.budget.id, payload);
        toast.success("Budget updated");
      } else {
        await budgetApi.create(payload);
        toast.success("Budget created");
      }
      setModal(null);
      load();
    } catch (error) {
      toast.error(formatApiError(error, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const deleteBudget = async (budget) => {
    if (!window.confirm("Delete this budget?")) return;
    try {
      await budgetApi.remove(budget.id);
      toast.success("Budget deleted");
      load();
    } catch (error) {
      toast.error(formatApiError(error, "Delete failed"));
    }
  };

  const currency = profile?.currency || "USD";

  return (
    <>
      <PageHeader
        title="Budgets"
        description="Monthly category limits with remaining balances and status signals."
        action={
          <button className="btn-primary" onClick={() => setModal({ type: "budget" })}>
            <Plus size={16} />
            Budget
          </button>
        }
      />
      <section className="panel reveal-up mb-6 max-w-xs p-5">
        <label>
          <span className="mb-1.5 block text-sm font-medium">Budget month</span>
          <input className="field" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        </label>
      </section>
      {loading ? (
        <LoadingSpinner label="Loading budgets" />
      ) : budgets.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {budgets.map((budget) => (
            <article key={budget.id} className="panel reveal-up p-5 transition hover:-translate-y-1 hover:shadow-premium">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-semibold">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: budget.category_color }} />
                    {budget.category_name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatCurrency(budget.spent, currency)} spent</p>
                </div>
                <span className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] ${statusStyles[budget.status]}`}>{budget.status}</span>
              </div>
              <div className="mt-5 h-2 rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-2 rounded-full bg-teal-600 dark:bg-teal-300" style={{ width: `${Math.min(100, budget.usage_percent)}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Budget</p>
                  <p className="font-semibold">{formatCurrency(budget.amount, currency)}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Remaining</p>
                  <p className="font-semibold">{formatCurrency(budget.remaining, currency)}</p>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button className="btn-secondary flex-1" onClick={() => setModal({ type: "budget", budget })}>
                  <Edit2 size={15} />
                  Edit
                </button>
                <button className="btn-secondary h-10 w-10 p-0" onClick={() => deleteBudget(budget)} aria-label="Delete budget">
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No budgets yet" message="Create a budget for a category to see warning states as spending grows." />
      )}
      {modal?.type === "budget" ? (
        <Modal title={modal.budget ? "Edit budget" : "New budget"} onClose={() => setModal(null)}>
          <BudgetForm categories={categories} initialValue={modal.budget} saving={saving} onCancel={() => setModal(null)} onSubmit={saveBudget} />
        </Modal>
      ) : null}
    </>
  );
}
