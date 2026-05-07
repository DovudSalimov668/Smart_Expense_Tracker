import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { authApi } from "../api/endpoints";
import FormInput from "../components/FormInput";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../utils/format";

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    currency: "USD",
    monthly_savings_goal: 0,
    user: { email: "", first_name: "", last_name: "" },
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        currency: profile.currency || "USD",
        monthly_savings_goal: profile.monthly_savings_goal || 0,
        user: {
          email: profile.user?.email || "",
          first_name: profile.user?.first_name || "",
          last_name: profile.user?.last_name || "",
        },
      });
    }
  }, [profile]);

  const update = (event) => {
    const { name, value } = event.target;
    if (name.startsWith("user.")) {
      const key = name.split(".")[1];
      setForm((current) => ({ ...current, user: { ...current.user, [key]: value } }));
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile(form);
      await refreshProfile();
      toast.success("Profile updated");
    } catch (error) {
      toast.error(formatApiError(error, "Could not update profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Profile" description="Account identity, preferred currency, and savings target." />
      <form className="panel max-w-3xl p-5" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Full name" name="full_name" value={form.full_name} onChange={update} />
          <FormInput label="Email" name="user.email" type="email" value={form.user.email} onChange={update} />
          <FormInput label="First name" name="user.first_name" value={form.user.first_name} onChange={update} />
          <FormInput label="Last name" name="user.last_name" value={form.user.last_name} onChange={update} />
          <label>
            <span className="mb-1.5 block text-sm font-medium">Currency</span>
            <select className="field" name="currency" value={form.currency} onChange={update}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="UZS">UZS</option>
              <option value="GBP">GBP</option>
            </select>
          </label>
          <FormInput
            label="Monthly savings goal"
            name="monthly_savings_goal"
            type="number"
            min="0"
            step="0.01"
            value={form.monthly_savings_goal}
            onChange={update}
          />
        </div>
        <div className="mt-6 flex justify-end">
          <button className="btn-primary" disabled={saving}>
            <Save size={16} />
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </>
  );
}
