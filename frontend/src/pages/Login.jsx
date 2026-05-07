import { WalletCards } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

import FormInput from "../components/FormInput";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../utils/format";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (error) {
      toast.error(formatApiError(error, "Login failed"));
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
            <h1 className="headline-display text-[2rem] text-slate-950 dark:text-white">Welcome back</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your spending, neatly organized.</p>
          </div>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <FormInput label="Username" name="username" required value={form.username} onChange={update} autoComplete="username" />
          <FormInput label="Password" name="password" type="password" required value={form.password} onChange={update} autoComplete="current-password" />
          <button className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          No account?{" "}
          <Link className="font-semibold text-slate-950 underline dark:text-white" to="/register">
            Create one
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-slate-400">Seed demo: demo / DemoPass123!</p>
      </div>
    </main>
  );
}
