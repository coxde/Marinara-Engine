// ──────────────────────────────────────────────
// App: Root component with layout
// ──────────────────────────────────────────────
import { AppShell } from "./components/layout/AppShell";
import { ModalRenderer } from "./components/layout/ModalRenderer";
import { Toaster } from "sonner";

export function App() {
  return (
    <>
      <AppShell />
      <ModalRenderer />
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          },
        }}
      />
    </>
  );
}
