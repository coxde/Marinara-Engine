// ──────────────────────────────────────────────
// Modal: Create Preset
// ──────────────────────────────────────────────
import { useState } from "react";
import { Modal } from "../ui/Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api-client";
import { Loader2, FileText } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreatePresetModal({ open, onClose }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    description: "",
    temperature: "0.9",
    maxTokens: "600",
    topP: "0.95",
    frequencyPenalty: "0",
    presencePenalty: "0",
  });

  const createPreset = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/prompts", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["presets"] });
      onClose();
      setForm({ name: "", description: "", temperature: "0.9", maxTokens: "600", topP: "0.95", frequencyPenalty: "0", presencePenalty: "0" });
    },
  });

  const handleCreate = () => {
    if (!form.name.trim()) return;
    createPreset.mutate({
      name: form.name,
      description: form.description,
      parameters: {
        temperature: parseFloat(form.temperature),
        maxTokens: parseInt(form.maxTokens),
        topP: parseFloat(form.topP),
        frequencyPenalty: parseFloat(form.frequencyPenalty),
        presencePenalty: parseFloat(form.presencePenalty),
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Preset" width="max-w-lg">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 shadow-lg shadow-purple-400/20">
            <FileText size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[var(--muted-foreground)]">
              Presets define the system prompt structure and generation parameters used during conversations.
            </p>
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--muted-foreground)]">Name *</span>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoFocus
            placeholder="My Preset..."
            className="w-full rounded-lg bg-[var(--secondary)] px-3 py-2 text-sm outline-none ring-1 ring-transparent transition-shadow focus:ring-[var(--primary)]"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--muted-foreground)]">Description</span>
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="What this preset is for..."
            className="w-full rounded-lg bg-[var(--secondary)] px-3 py-2 text-sm outline-none ring-1 ring-transparent transition-shadow focus:ring-[var(--primary)]"
          />
        </label>

        {/* Parameter grid */}
        <div className="mt-1">
          <span className="text-xs font-medium text-[var(--muted-foreground)]">Generation Parameters</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <ParamField label="Temperature" value={form.temperature} onChange={(v) => setForm((f) => ({ ...f, temperature: v }))} />
            <ParamField label="Max Tokens" value={form.maxTokens} onChange={(v) => setForm((f) => ({ ...f, maxTokens: v }))} />
            <ParamField label="Top P" value={form.topP} onChange={(v) => setForm((f) => ({ ...f, topP: v }))} />
            <ParamField label="Freq. Penalty" value={form.frequencyPenalty} onChange={(v) => setForm((f) => ({ ...f, frequencyPenalty: v }))} />
            <ParamField label="Pres. Penalty" value={form.presencePenalty} onChange={(v) => setForm((f) => ({ ...f, presencePenalty: v }))} />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-3">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)]">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={!form.name.trim() || createPreset.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-foreground)] transition-all hover:opacity-90 disabled:opacity-50"
          >
            {createPreset.isPending ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
            Create Preset
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ParamField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] text-[var(--muted-foreground)]">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md bg-[var(--background)] px-2 py-1.5 text-xs tabular-nums outline-none ring-1 ring-[var(--border)] transition-shadow focus:ring-[var(--primary)]"
      />
    </label>
  );
}
