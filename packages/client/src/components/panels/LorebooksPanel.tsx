// ──────────────────────────────────────────────
// Panel: Lorebooks (polished)
// ──────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api-client";
import { Plus, Upload, BookOpen, Trash2 } from "lucide-react";
import { useUIStore } from "../../stores/ui.store";

export function LorebooksPanel() {
  const { data: lorebooks, isLoading } = useQuery({
    queryKey: ["lorebooks"],
    queryFn: () => api.get<Array<{ id: string; name: string; description: string }>>("/lorebooks"),
  });
  const qc = useQueryClient();
  const deleteLorebook = useMutation({
    mutationFn: (id: string) => api.delete(`/lorebooks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lorebooks"] }),
  });
  const openModal = useUIStore((s) => s.openModal);

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex gap-2">
        <button
          onClick={() => openModal("create-lorebook")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2.5 text-xs font-medium text-white shadow-md shadow-amber-400/15 transition-all hover:shadow-lg hover:shadow-amber-400/25 active:scale-[0.98]"
        >
          <Plus size={13} /> New
        </button>
        <button
          onClick={() => openModal("import-lorebook")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--secondary)] px-3 py-2.5 text-xs font-medium text-[var(--secondary-foreground)] ring-1 ring-[var(--border)] transition-all hover:bg-[var(--accent)] active:scale-[0.98]"
        >
          <Upload size={13} /> Import
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2 py-2">
          {[1, 2].map((i) => (
            <div key={i} className="shimmer h-14 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && (!lorebooks || lorebooks.length === 0) && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="animate-float flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20">
            <BookOpen size={20} className="text-amber-400" />
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">No lorebooks yet</p>
        </div>
      )}

      <div className="stagger-children flex flex-col gap-1">
        {lorebooks?.map((lb) => (
          <div
            key={lb.id}
            className="group flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-[var(--sidebar-accent)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
              <BookOpen size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{lb.name}</div>
              <div className="truncate text-[11px] text-[var(--muted-foreground)]">
                {lb.description || "No description"}
              </div>
            </div>
            <button
              onClick={() => deleteLorebook.mutate(lb.id)}
              className="rounded-lg p-1.5 opacity-0 transition-all hover:bg-[var(--destructive)]/15 group-hover:opacity-100 active:scale-90"
            >
              <Trash2 size={13} className="text-[var(--destructive)]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
