import { Check, Layers, Palette } from "lucide-react";

import PageHeader from "../components/PageHeader";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { currentTheme, setTheme, themes } = useTheme();

  return (
    <>
      <PageHeader title="Settings" description="Appearance, theme presets, and account preferences." />
      <section className="panel max-w-5xl divide-y divide-slate-200/70 dark:divide-white/10">
        <div className="p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Palette size={18} />
                <h2 className="font-semibold">Theme studio</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a full app skin with matching surfaces, accents, charts, and auth screens.</p>
            </div>
            <span className="rounded-lg border border-slate-200/70 bg-white/70 px-3 py-1.5 text-xs font-semibold dark:border-white/10 dark:bg-white/10">
              {currentTheme.name}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {themes.map((themeOption) => {
              const selected = currentTheme.id === themeOption.id;
              return (
                <button
                  key={themeOption.id}
                  className={`group rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-premium ${
                    selected
                      ? "border-[color:var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,white)] dark:bg-white/10"
                      : "border-slate-200/80 bg-white/60 dark:border-white/10 dark:bg-white/[0.04]"
                  }`}
                  onClick={() => setTheme(themeOption.id)}
                  type="button"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {themeOption.swatches.map((swatch) => (
                        <span key={swatch} className="h-7 w-7 rounded-lg border border-white/70 shadow-sm dark:border-white/10" style={{ backgroundColor: swatch }} />
                      ))}
                    </div>
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-lg border transition ${
                        selected ? "border-transparent bg-[color:var(--accent)] text-white" : "border-slate-200 text-transparent dark:border-white/10"
                      }`}
                    >
                      <Check size={15} />
                    </span>
                  </div>
                  <p className="font-semibold text-slate-950 dark:text-white">{themeOption.name}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{themeOption.description}</p>
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2">
            <Layers size={18} />
            <h2 className="font-semibold">Design system</h2>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Themes use shared CSS tokens, so buttons, cards, charts, forms, backgrounds, and modal surfaces stay consistent while the visual mood changes.
          </p>
        </div>
        <div className="p-5">
          <div>
            <h2 className="font-semibold">Data ownership</h2>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Your API data is scoped to your authenticated user, with JWT protected requests and owner-filtered querysets.
          </p>
        </div>
      </section>
    </>
  );
}
