import { WalletCards } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import FormInput from "../components/FormInput";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../utils/format";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(formatApiError(error, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-backdrop grid min-h-screen place-items-center px-4 py-10 text-white">
      <div className="reveal-up w-full max-w-md rounded-xl border border-white/[0.15] bg-white/[0.94] p-7 text-slate-950 shadow-premium backdrop-blur-2xl dark:bg-slate-950/82 dark:text-white">
        <div className="mb-7 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <WalletCards size={24} />
          </div>
          <div>
            <h1 className="headline-display text-[2rem] text-slate-950 dark:text-white">Create account</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Build your personal finance view.</p>
          </div>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <FormInput label="Full name" name="full_name" value={form.full_name} onChange={update} />
          <FormInput label="Username" name="username" required value={form.username} onChange={update} autoComplete="username" />
          <FormInput label="Email" name="email" type="email" value={form.email} onChange={update} autoComplete="email" />
          <FormInput label="Password" name="password" type="password" required value={form.password} onChange={update} autoComplete="new-password" />
          <button className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Already registered?{" "}
          <Link className="font-semibold text-slate-950 underline dark:text-white" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
