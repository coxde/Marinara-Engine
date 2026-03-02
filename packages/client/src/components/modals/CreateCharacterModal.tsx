// ──────────────────────────────────────────────
// Modal: Create Character
// ──────────────────────────────────────────────
import { useState } from "react";
import { Modal } from "../ui/Modal";
import { useCreateCharacter } from "../../hooks/use-characters";
import { Loader2, Sparkles, User } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateCharacterModal({ open, onClose }: Props) {
  const createCharacter = useCreateCharacter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    personality: "",
    firstMessage: "",
    scenario: "",
    systemPrompt: "",
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleCreate = () => {
    if (!form.name.trim()) return;

    createCharacter.mutate(
      {
        name: form.name,
        data: {
          name: form.name,
          description: form.description,
          personality: form.personality,
          first_mes: form.firstMessage,
          scenario: form.scenario,
          system_prompt: form.systemPrompt,
          mes_example: "",
          creator_notes: "",
          tags: [],
          creator: "",
          character_version: "1.0",
          extensions: {},
          alternate_greetings: [],
          character_book: undefined,
          post_history_instructions: "",
        },
        format: "chara_card_v2" as const,
      },
      {
        onSuccess: () => {
          onClose();
          setForm({ name: "", description: "", personality: "", firstMessage: "", scenario: "", systemPrompt: "" });
        },
      },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Character" width="max-w-lg">
      <div className="flex flex-col gap-3">
        {/* Avatar preview area */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-pink-400/20">
            <User size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <label className="mb-1 text-xs font-medium text-[var(--muted-foreground)]">Name *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Character name..."
              autoFocus
              className="w-full rounded-lg bg-[var(--secondary)] px-3 py-2 text-sm outline-none ring-1 ring-transparent transition-shadow focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        <FieldTextarea label="Description" placeholder="A brief description of the character..." value={form.description} onChange={(v) => set("description", v)} rows={2} />
        <FieldTextarea label="Personality" placeholder="Character traits, behavior..." value={form.personality} onChange={(v) => set("personality", v)} rows={2} />
        <FieldTextarea label="First Message" placeholder="The character's opening message..." value={form.firstMessage} onChange={(v) => set("firstMessage", v)} rows={3} />
        <FieldTextarea label="Scenario" placeholder="Setting or context for the conversation..." value={form.scenario} onChange={(v) => set("scenario", v)} rows={2} />
        <FieldTextarea label="System Prompt" placeholder="Override the system prompt (optional)..." value={form.systemPrompt} onChange={(v) => set("systemPrompt", v)} rows={2} />

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)]"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!form.name.trim() || createCharacter.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-foreground)] transition-all hover:opacity-90 disabled:opacity-50"
          >
            {createCharacter.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
            Create Character
          </button>
        </div>
      </div>
    </Modal>
  );
}

function FieldTextarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="resize-none rounded-lg bg-[var(--secondary)] px-3 py-2 text-sm leading-relaxed outline-none ring-1 ring-transparent transition-shadow focus:ring-[var(--primary)]"
      />
    </label>
  );
}
