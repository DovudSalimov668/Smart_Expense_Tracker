import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">The route you opened does not exist in this app.</p>
        <Link className="btn-primary mt-6" to="/dashboard">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
