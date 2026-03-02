// ──────────────────────────────────────────────
// Importer: SillyTavern Chat (JSONL)
// ──────────────────────────────────────────────
import type { DB } from "../../db/connection.js";
import { createChatsStorage } from "../storage/chats.storage.js";
import type { ChatMode } from "@rpg-engine/shared";

interface STChatHeader {
  user_name?: string;
  character_name?: string;
  chat_metadata?: Record<string, unknown>;
}

interface STChatMessage {
  name: string;
  is_user: boolean;
  is_system?: boolean;
  send_date?: string;
  mes: string;
  extra?: {
    display_text?: string;
    type?: string;
  };
}

/**
 * Import a SillyTavern JSONL chat file.
 *
 * Format: Line 0 = header JSON, lines 1+ = message JSON per line.
 */
export async function importSTChat(jsonlContent: string, db: DB) {
  const storage = createChatsStorage(db);
  const lines = jsonlContent.split("\n").filter((l) => l.trim());

  if (lines.length < 2) {
    return { error: "Invalid JSONL: too few lines" };
  }

  // Parse header
  const header = JSON.parse(lines[0]!) as STChatHeader;
  const characterName = header.character_name ?? "Unknown";
  const userName = header.user_name ?? "User";

  // Create the chat
  const chat = await storage.create({
    name: `${characterName} (imported)`,
    mode: "roleplay" as ChatMode,
    characterIds: [], // Will need to link after character import
    personaId: null,
    promptPresetId: null,
    connectionId: null,
  });

  if (!chat) return { error: "Failed to create chat" };

  // Import messages
  let imported = 0;
  for (let i = 1; i < lines.length; i++) {
    try {
      const stMsg = JSON.parse(lines[i]!) as STChatMessage;

      // Skip system/hidden messages
      if (stMsg.is_system) continue;

      const role = stMsg.is_user ? "user" : "assistant";
      const content = stMsg.extra?.display_text ?? stMsg.mes;

      await storage.createMessage({
        chatId: chat.id,
        role,
        characterId: null,
        content,
      });
      imported++;
    } catch {
      // Skip malformed lines
    }
  }

  return {
    success: true,
    chatId: chat.id,
    characterName,
    userName,
    messagesImported: imported,
  };
}
