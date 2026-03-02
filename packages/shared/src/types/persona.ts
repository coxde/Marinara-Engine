// ──────────────────────────────────────────────
// User Persona Types
// ──────────────────────────────────────────────

/** A user persona (the player's character/identity). */
export interface Persona {
  id: string;
  name: string;
  description: string;
  /** Avatar image path */
  avatarPath: string | null;
  /** Whether this is the currently active persona */
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
