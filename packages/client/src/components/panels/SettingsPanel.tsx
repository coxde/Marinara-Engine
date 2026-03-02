// ──────────────────────────────────────────────
// Panel: Settings (polished)
// ──────────────────────────────────────────────
import { useUIStore } from "../../stores/ui.store";
import { cn } from "../../lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api-client";
import { useRef, useState } from "react";
import { Upload, X, Image, Trash2, Check, Loader2 } from "lucide-react";

const TABS = [
  { id: "general", label: "General" },
  { id: "appearance", label: "Appearance" },
  { id: "import", label: "Import/Export" },
  { id: "advanced", label: "Advanced" },
] as const;

export function SettingsPanel() {
  const settingsTab = useUIStore((s) => s.settingsTab);
  const setSettingsTab = useUIStore((s) => s.setSettingsTab);

  return (
    <div className="flex flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-[var(--sidebar-border)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSettingsTab(tab.id)}
            className={cn(
              "relative flex-1 py-2.5 text-xs font-medium transition-colors",
              settingsTab === tab.id
                ? "text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
            )}
          >
            {tab.label}
            {settingsTab === tab.id && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[var(--primary)]" />
            )}
          </button>
        ))}
      </div>

      <div className="p-3">
        {settingsTab === "general" && <GeneralSettings />}
        {settingsTab === "appearance" && <AppearanceSettings />}
        {settingsTab === "import" && <ImportSettings />}
        {settingsTab === "advanced" && <AdvancedSettings />}
      </div>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="flex flex-col gap-3 animate-fade-in-up">
      <div className="text-xs text-[var(--muted-foreground)]">
        General application settings.
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium">Default User Name</span>
        <input
          defaultValue="User"
          className="rounded-lg bg-[var(--secondary)] px-3 py-2 text-xs outline-none ring-1 ring-transparent transition-shadow focus:ring-[var(--primary)]"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium">Default Chat Mode</span>
        <select className="rounded-lg bg-[var(--secondary)] px-3 py-2 text-xs outline-none ring-1 ring-transparent transition-shadow focus:ring-[var(--primary)]">
          <option value="conversation">Conversation</option>
          <option value="roleplay">Roleplay</option>
          <option value="visual_novel">Visual Novel</option>
        </select>
      </label>
    </div>
  );
}

function AppearanceSettings() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const chatBackground = useUIStore((s) => s.chatBackground);
  const setChatBackground = useUIStore((s) => s.setChatBackground);

  return (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium">Theme</span>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as "dark" | "light")}
          className="rounded-lg bg-[var(--secondary)] px-3 py-2 text-xs outline-none ring-1 ring-transparent transition-shadow focus:ring-[var(--primary)]"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium">Font Size</span>
        <select
          defaultValue="14"
          className="rounded-lg bg-[var(--secondary)] px-3 py-2 text-xs outline-none ring-1 ring-transparent transition-shadow focus:ring-[var(--primary)]"
        >
          <option value="12">Small (12px)</option>
          <option value="14">Default (14px)</option>
          <option value="16">Large (16px)</option>
          <option value="18">Extra Large (18px)</option>
        </select>
      </label>

      {/* ── Chat Background Picker ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Chat Background</span>
          {chatBackground && (
            <button
              onClick={() => setChatBackground(null)}
              className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-[var(--destructive)] transition-colors hover:bg-[var(--destructive)]/10"
            >
              <X size={10} /> Remove
            </button>
          )}
        </div>
        <BackgroundPicker
          selected={chatBackground}
          onSelect={setChatBackground}
        />
      </div>
    </div>
  );
}

function BackgroundPicker({ selected, onSelect }: { selected: string | null; onSelect: (url: string | null) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();

  const { data: backgrounds } = useQuery({
    queryKey: ["backgrounds"],
    queryFn: () => api.get<Array<{ filename: string; url: string }>>("/backgrounds"),
  });

  const deleteBg = useMutation({
    mutationFn: (filename: string) => api.delete(`/backgrounds/${filename}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backgrounds"] }),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/backgrounds/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        qc.invalidateQueries({ queryKey: ["backgrounds"] });
        onSelect(data.url);
      }
    } catch {
      // ignore
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Upload button */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[var(--border)] p-3 text-xs text-[var(--muted-foreground)] transition-all hover:border-[var(--primary)]/40 hover:bg-[var(--secondary)]/50"
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading ? "Uploading..." : "Upload Background"}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      {/* Background grid */}
      {backgrounds && backgrounds.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {backgrounds.map((bg) => {
            const isSelected = selected === bg.url;
            return (
              <div key={bg.filename} className="group relative">
                <button
                  onClick={() => onSelect(isSelected ? null : bg.url)}
                  className={cn(
                    "aspect-video w-full overflow-hidden rounded-lg border-2 transition-all",
                    isSelected
                      ? "border-[var(--primary)] shadow-md shadow-[var(--primary)]/20"
                      : "border-transparent hover:border-[var(--muted-foreground)]/30",
                  )}
                >
                  <img
                    src={bg.url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </button>
                {/* Delete overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selected === bg.url) onSelect(null);
                    deleteBg.mutate(bg.filename);
                  }}
                  className="absolute right-0.5 top-0.5 rounded-md bg-black/60 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 size={10} className="text-white" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {(!backgrounds || backgrounds.length === 0) && (
        <div className="flex flex-col items-center gap-1.5 py-4 text-center">
          <Image size={20} className="text-[var(--muted-foreground)]/40" />
          <p className="text-[10px] text-[var(--muted-foreground)]">
            No backgrounds uploaded yet
          </p>
        </div>
      )}
    </div>
  );
}

function ImportSettings() {
  return (
    <div className="flex flex-col gap-3 animate-fade-in-up">
      <div className="text-xs text-[var(--muted-foreground)]">
        Import data from SillyTavern or other tools.
      </div>

      <div className="flex flex-col gap-2">
        <ImportButton label="Import Character (JSON/PNG)" accept=".json,.png" endpoint="/import/character" />
        <ImportButton label="Import Chat (JSONL)" accept=".jsonl" endpoint="/import/chat" />
        <ImportButton label="Import Preset (JSON)" accept=".json" endpoint="/import/preset" />
        <ImportButton label="Import Lorebook (JSON)" accept=".json" endpoint="/import/lorebook" />
      </div>
    </div>
  );
}

function ImportButton({ label, accept, endpoint }: { label: string; accept: string; endpoint: string }) {
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api${endpoint}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert(`Imported successfully!`);
      } else {
        alert(`Import failed: ${data.error ?? "Unknown error"}`);
      }
    } catch {
      alert("Import failed.");
    }
    e.target.value = "";
  };

  return (
    <label className="flex cursor-pointer items-center justify-center rounded-xl bg-[var(--secondary)] px-3 py-2.5 text-xs font-medium text-[var(--secondary-foreground)] ring-1 ring-[var(--border)] transition-all hover:bg-[var(--accent)] active:scale-[0.98]">
      {label}
      <input type="file" accept={accept} onChange={handleImport} className="hidden" />
    </label>
  );
}

function AdvancedSettings() {
  return (
    <div className="flex flex-col gap-3 animate-fade-in-up">
      <div className="text-xs text-[var(--muted-foreground)]">
        Advanced settings for power users.
      </div>

      <ToggleSetting label="Enable streaming responses" defaultChecked />
      <ToggleSetting label="Auto-save chat history" defaultChecked />
      <ToggleSetting label="Debug mode (log prompts to console)" />
    </div>
  );
}

function ToggleSetting({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2.5 rounded-lg p-1 transition-colors hover:bg-[var(--secondary)]/50">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-3.5 w-3.5 rounded border-[var(--border)] accent-[var(--primary)]"
      />
      <span className="text-xs">{label}</span>
    </label>
  );
}
