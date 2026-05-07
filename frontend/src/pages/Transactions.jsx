import { Download, FileText, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { categoryApi, transactionApi } from "../api/endpoints";
import FormInput from "../components/FormInput";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import { useAuth } from "../context/AuthContext";
import { downloadBlob, formatApiError } from "../utils/format";

export default function Transactions() {
  const { profile } = useAuth();
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ results: [], count: 0 });
  const [filters, setFilters] = useState({ search: "", category: "", type: "", start_date: "", end_date: "", page: 1 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [categoryResponse, transactionResponse] = await Promise.all([
        categoryApi.list(),
        transactionApi.list(filters),
      ]);
      setCategories(categoryResponse.data.results || categoryResponse.data);
      setData(transactionResponse.data);
    } catch (error) {
      toast.error(formatApiError(error, "Could not load transactions"));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const updateFilter = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value, page: 1 }));
  };

  const saveTransaction = async (payload) => {
    setSaving(true);
    try {
      if (modal?.transaction) {
        await transactionApi.update(modal.transaction.id, payload);
        toast.success("Transaction updated");
      } else {
        await transactionApi.create(payload);
        toast.success("Transaction created");
      }
      setModal(null);
      load();
    } catch (error) {
      toast.error(formatApiError(error, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const deleteTransaction = async (transaction) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await transactionApi.remove(transaction.id);
      toast.success("Transaction deleted");
      load();
    } catch (error) {
      toast.error(formatApiError(error, "Delete failed"));
    }
  };

  const createCategory = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await categoryApi.create({
        name: form.get("name"),
        type: form.get("type"),
        color: form.get("color"),
      });
      toast.success("Category added");
      setModal(null);
      load();
    } catch (error) {
      toast.error(formatApiError(error, "Could not create category"));
    }
  };

  const exportFile = async (type) => {
    const exportFilters = Object.fromEntries(Object.entries(filters).filter(([key, value]) => key !== "page" && value));
    try {
      const response = type === "pdf" ? await transactionApi.exportPdf(exportFilters) : await transactionApi.exportCsv(exportFilters);
      downloadBlob(response.data, `transactions.${type}`);
    } catch (error) {
      toast.error(formatApiError(error, "Export failed"));
    }
  };

  const totalPages = Math.max(1, Math.ceil((data.count || 0) / 8));

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Review income and expenses with precise filters, editing, and exports."
        action={
          <>
            <button className="btn-secondary" onClick={() => exportFile("csv")}>
              <Download size={16} />
              CSV
            </button>
            <button className="btn-secondary" onClick={() => exportFile("pdf")}>
              <FileText size={16} />
              PDF
            </button>
            <button className="btn-secondary" onClick={() => setModal({ type: "category" })}>
              <Plus size={16} />
              Category
            </button>
            <button className="btn-primary" onClick={() => setModal({ type: "transaction" })}>
              <Plus size={16} />
              Transaction
            </button>
          </>
        }
      />
      <section className="panel reveal-up mb-6 grid gap-4 p-5 md:grid-cols-5">
        <FormInput label="Search" name="search" value={filters.search} onChange={updateFilter} placeholder="Note or category" />
        <label>
          <span className="mb-1.5 block text-sm font-medium">Type</span>
          <select className="field" name="type" value={filters.type} onChange={updateFilter}>
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-medium">Category</span>
          <select className="field" name="category" value={filters.category} onChange={updateFilter}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <FormInput label="From" name="start_date" type="date" value={filters.start_date} onChange={updateFilter} />
        <FormInput label="To" name="end_date" type="date" value={filters.end_date} onChange={updateFilter} />
      </section>
      <section className="panel reveal-up p-5">
        {loading ? (
          <LoadingSpinner label="Loading transactions" />
        ) : (
          <>
            <TransactionTable
              transactions={data.results || []}
              currency={profile?.currency || "USD"}
              onEdit={(transaction) => setModal({ type: "transaction", transaction })}
              onDelete={deleteTransaction}
            />
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Page {filters.page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button className="btn-secondary" disabled={!data.previous} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>
                  Previous
                </button>
                <button className="btn-secondary" disabled={!data.next} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
      {modal?.type === "transaction" ? (
        <Modal title={modal.transaction ? "Edit transaction" : "New transaction"} onClose={() => setModal(null)}>
          <TransactionForm categories={categories} initialValue={modal.transaction} saving={saving} onCancel={() => setModal(null)} onSubmit={saveTransaction} />
        </Modal>
      ) : null}
      {modal?.type === "category" ? (
        <Modal title="Create custom category" onClose={() => setModal(null)}>
          <form className="grid gap-4" onSubmit={createCategory}>
            <FormInput label="Name" name="name" required placeholder="Healthcare" />
            <label>
              <span className="mb-1.5 block text-sm font-medium">Type</span>
              <select className="field" name="type" defaultValue="expense">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="both">Both</option>
              </select>
            </label>
            <FormInput label="Color" name="color" type="color" defaultValue="#2563eb" />
            <div className="flex justify-end">
              <button className="btn-primary">Create category</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}
