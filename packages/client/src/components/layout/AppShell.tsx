// ──────────────────────────────────────────────
// Layout: Main App Shell (Discord-like three-column)
// ──────────────────────────────────────────────
import { ChatSidebar } from "./ChatSidebar";
import { ChatArea } from "../chat/ChatArea";
import { RightPanel } from "./RightPanel";
import { TopBar } from "./TopBar";
import { useUIStore } from "../../stores/ui.store";
import { motion, AnimatePresence } from "framer-motion";

export function AppShell() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const sidebarWidth = useUIStore((s) => s.sidebarWidth);

  return (
    <div className="retro-scanlines noise-bg geometric-grid flex h-screen w-screen overflow-hidden bg-[var(--background)]">
      {/* Y2K decorative stars */}
      <div className="y2k-star" style={{ top: '10%', left: '5%', animationDelay: '0s' }} />
      <div className="y2k-star-md" style={{ top: '25%', right: '8%', animationDelay: '1.5s' }} />
      <div className="y2k-star-lg" style={{ top: '60%', left: '3%', animationDelay: '3s' }} />
      <div className="y2k-star" style={{ top: '80%', right: '12%', animationDelay: '0.8s' }} />
      <div className="y2k-star-md" style={{ top: '45%', left: '50%', animationDelay: '2.2s' }} />

      {/* Left sidebar - Chat list */}
      <aside
        className="flex-shrink-0 overflow-hidden border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ width: sidebarOpen ? sidebarWidth : 0 }}
      >
        <div className="h-full" style={{ width: sidebarWidth }}>
          <ChatSidebar />
        </div>
      </aside>

      {/* Center content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <ChatArea />
      </div>

      {/* Right panel - Context / Settings */}
      <AnimatePresence mode="wait">
        {rightPanelOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="flex-shrink-0 overflow-hidden border-l border-[var(--sidebar-border)] bg-[var(--sidebar)]"
          >
            <div className="h-full w-80">
              <RightPanel />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
