// ──────────────────────────────────────────────
// Panel: API Connections (polished)
// ──────────────────────────────────────────────
import { useConnections, useCreateConnection, useDeleteConnection, useTestConnection } from "../../hooks/use-connections";
import { useUpdateChat } from "../../hooks/use-chats";
import { useChatStore } from "../../stores/chat.store";
import { Plus, Trash2, Link, CheckCircle, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { PROVIDERS } from "@rpg-engine/shared";
import { cn } from "../../lib/utils";

export function ConnectionsPanel() {
  const { data: connections, isLoading } = useConnections();
  const createConnection = useCreateConnection();
  const deleteConnection = useDeleteConnection();
  const testConnection = useTestConnection();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", provider: "openai", apiKey: "", baseUrl: "", model: "" });
  const activeChat = useChatStore((s) => s.activeChat);
  const updateChat = useUpdateChat();

  const activeConnectionId = activeChat?.connectionId ?? null;

  const selectConnection = (connId: string) => {
    if (!activeChat) return;
    const newId = activeConnectionId === connId ? null : connId;
    updateChat.mutate({ id: activeChat.id, connectionId: newId });
  };

  const handleCreate = () => {
    createConnection.mutate(form, {
      onSuccess: () => {
        setShowForm(false);
        setForm({ name: "", provider: "openai", apiKey: "", baseUrl: "", model: "" });
      },
    });
  };

  return (
    <div className="flex flex-col gap-2 p-3">
      <button
        onClick={() => setShowForm(!showForm)}
        className={cn(
          "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all active:scale-[0.98]",
          showForm
            ? "bg-[var(--secondary)] text-[var(--secondary-foreground)] ring-1 ring-[var(--border)]"
            : "bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md shadow-sky-400/15 hover:shadow-lg hover:shadow-sky-400/25",
        )}
      >
        <Plus size={13} /> {showForm ? "Cancel" : "Add Connection"}
      </button>

      {/* Quick create form */}
      {showForm && (
        <div className="animate-scale-in flex flex-col gap-2 rounded-xl bg-[var(--secondary)] p-3 ring-1 ring-[var(--border)]">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg bg-[var(--background)] px-3 py-2 text-xs outline-none ring-1 ring-transparent transition-shadow focus:ring-[var(--primary)]"
          />
          <select
            value={form.provider}
            onChange={(e) => setForm({ ...form, provider: e.target.value })}
            className="rounded-lg bg-[var(--background)] px-3 py-2 text-xs outline-none ring-1 ring-transparent transition-shadow focus:ring-[var(--primary)]"
          >
            {Object.entries(PROVIDERS).map(([key, info]) => (
              <option key={key} value={key}>{info.name}</option>
            ))}
          </select>
          <input
            placeholder="API Key"
            type="password"
            value={form.apiKey}
            onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
            className="rounded-lg bg-[var(--background)] px-3 py-2 text-xs outline-none ring-1 ring-transparent transition-shadow focus:ring-[var(--primary)]"
          />
          <input
            placeholder="Base URL (optional)"
            value={form.baseUrl}
            onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
            className="rounded-lg bg-[var(--background)] px-3 py-2 text-xs outline-none ring-1 ring-transparent transition-shadow focus:ring-[var(--primary)]"
          />
          <input
            placeholder="Model"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            className="rounded-lg bg-[var(--background)] px-3 py-2 text-xs outline-none ring-1 ring-transparent transition-shadow focus:ring-[var(--primary)]"
          />
          <button
            onClick={handleCreate}
            disabled={createConnection.isPending || !form.name.trim()}
            className="rounded-lg bg-gradient-to-r from-sky-400 to-blue-500 px-3 py-2 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
          >
            {createConnection.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-2 py-2">
          {[1, 2].map((i) => (
            <div key={i} className="shimmer h-14 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && (!connections || (connections as unknown[]).length === 0) && !showForm && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="animate-float flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/20 to-blue-500/20">
            <Link size={20} className="text-sky-400" />
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">No connections yet</p>
        </div>
      )}

      <div className="stagger-children flex flex-col gap-1">
        {(connections as Array<{ id: string; name: string; provider: string; model: string }>)?.map((conn) => {
          const isSelected = activeConnectionId === conn.id;
          return (
          <div
            key={conn.id}
            onClick={() => selectConnection(conn.id)}
            className={cn(
              "group flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-[var(--sidebar-accent)]",
              isSelected && "ring-1 ring-sky-400/40 bg-sky-400/5",
            )}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-sm">
              <Link size={16} />
              {isSelected && (
                <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-400 shadow-sm">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{conn.name}</div>
              <div className="truncate text-[11px] text-[var(--muted-foreground)]">
                {conn.provider} • {conn.model || "No model set"}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); testConnection.mutate(conn.id); }}
              className="rounded-lg p-1.5 text-[var(--muted-foreground)] transition-all hover:bg-sky-400/10 active:scale-90"
              title="Test connection"
            >
              {testConnection.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <CheckCircle size={13} />
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteConnection.mutate(conn.id); }}
              className="rounded-lg p-1.5 opacity-0 transition-all hover:bg-[var(--destructive)]/15 group-hover:opacity-100 active:scale-90"
            >
              <Trash2 size={13} className="text-[var(--destructive)]" />
            </button>
          </div>
          );
        })}
      </div>
      {activeChat && (
        <p className="px-1 text-[10px] text-[var(--muted-foreground)]/60">
          Click to set as active connection for this chat
        </p>
      )}
    </div>
  );
}
