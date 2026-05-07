import { Menu, Palette, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({ onMenuClick }) {
  const { profile } = useAuth();
  const { currentTheme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
        <button className="btn-secondary h-10 w-10 p-0 lg:hidden" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <Link
          to="/transactions"
          className="hidden min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200/80 bg-white/80 px-4 py-2 text-sm text-slate-500 shadow-sm transition hover:border-teal-200 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.08] dark:text-slate-400 dark:hover:border-teal-300/40 dark:hover:text-white md:flex"
        >
          <Search size={16} />
          <span>Search transactions and categories</span>
        </Link>
        <button className="btn-secondary h-10 w-10 p-0" onClick={toggleTheme} aria-label={`Switch theme. Current theme is ${currentTheme.name}`} title={currentTheme.name}>
          <Palette size={18} />
        </button>
        <Link to="/profile" className="flex items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-white/70 dark:hover:bg-white/10">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
            {(profile?.full_name || profile?.user?.username || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold">{profile?.full_name || profile?.user?.username}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{profile?.currency || "USD"}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
