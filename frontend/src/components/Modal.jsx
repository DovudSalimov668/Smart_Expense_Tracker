import { X } from "lucide-react";

export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/[0.55] p-4 backdrop-blur-sm">
      <div className="panel max-h-[90vh] w-full max-w-2xl overflow-y-auto shadow-premium">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h2>
          <button className="btn-secondary h-9 w-9 p-0" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
