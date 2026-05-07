import { Edit2, Trash2 } from "lucide-react";

import { formatCurrency, formatDate } from "../utils/format";
import EmptyState from "./EmptyState";

export default function TransactionTable({ transactions, currency, onEdit, onDelete }) {
  const showActions = Boolean(onEdit || onDelete);

  if (!transactions.length) {
    return <EmptyState title="No transactions found" message="Add your first transaction or adjust the current filters." />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/[0.66] shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/70 text-sm dark:divide-white/10">
          <thead className="bg-slate-50/90 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Amount</th>
              {showActions ? <th className="px-4 py-3 text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white/80 dark:divide-white/10 dark:bg-transparent">
            {transactions.map((tx) => (
              <tr key={tx.id} className="transition hover:bg-teal-50/50 dark:hover:bg-white/[0.03]">
                <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(tx.date)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tx.category_color }} />
                    {tx.category_name}
                  </span>
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-slate-500 dark:text-slate-400">{tx.note || "No note"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-semibold capitalize ${
                      tx.type === "income"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    {tx.type}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                  {tx.type === "expense" ? "-" : "+"}
                  {formatCurrency(tx.amount, currency)}
                </td>
                {showActions ? (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit ? (
                        <button className="btn-secondary h-9 w-9 p-0" onClick={() => onEdit(tx)} aria-label="Edit transaction">
                          <Edit2 size={15} />
                        </button>
                      ) : null}
                      {onDelete ? (
                        <button className="btn-secondary h-9 w-9 p-0" onClick={() => onDelete(tx)} aria-label="Delete transaction">
                          <Trash2 size={15} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
