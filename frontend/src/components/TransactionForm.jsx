import { useMemo, useState } from "react";

import FormInput from "./FormInput";

const today = new Date().toISOString().slice(0, 10);

export default function TransactionForm({ categories, initialValue, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState({
    type: initialValue?.type || "expense",
    amount: initialValue?.amount || "",
    category: initialValue?.category || "",
    note: initialValue?.note || "",
    date: initialValue?.date || today,
  });

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === form.type || category.type === "both"),
    [categories, form.type],
  );

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "type" ? { category: "" } : {}),
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit({ ...form, amount: Number(form.amount), category: Number(form.category) });
  };

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Type</span>
        <select className="field" name="type" value={form.type} onChange={update}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput label="Amount" name="amount" type="number" min="0" step="0.01" required value={form.amount} onChange={update} />
        <FormInput label="Date" name="date" type="date" required value={form.date} onChange={update} />
      </div>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Category</span>
        <select className="field" name="category" required value={form.category} onChange={update}>
          <option value="">Select category</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Note</span>
        <textarea className="field min-h-24" name="note" value={form.note} onChange={update} placeholder="Optional transaction note" />
      </label>
      <div className="flex justify-end gap-2">
        <button className="btn-secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save transaction"}
        </button>
      </div>
    </form>
  );
}
