import { useState } from "react";

import { monthInputValue, monthToApiDate } from "../utils/format";
import FormInput from "./FormInput";

export default function BudgetForm({ categories, initialValue, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState({
    category: initialValue?.category || "",
    amount: initialValue?.amount || "",
    month: initialValue?.month ? initialValue.month.slice(0, 7) : monthInputValue(),
  });
  const expenseCategories = categories.filter((category) => category.type !== "income");

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      category: Number(form.category),
      amount: Number(form.amount),
      month: monthToApiDate(form.month),
    });
  };

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Category</span>
        <select className="field" name="category" required value={form.category} onChange={update}>
          <option value="">Select category</option>
          {expenseCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput label="Budget amount" name="amount" type="number" min="0" step="0.01" required value={form.amount} onChange={update} />
        <FormInput label="Month" name="month" type="month" required value={form.month} onChange={update} />
      </div>
      <div className="flex justify-end gap-2">
        <button className="btn-secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save budget"}
        </button>
      </div>
    </form>
  );
}
