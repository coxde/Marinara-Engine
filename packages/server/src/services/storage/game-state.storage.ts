// ──────────────────────────────────────────────
// Storage: Game State Snapshots
// ──────────────────────────────────────────────
import { eq, and, desc } from "drizzle-orm";
import type { DB } from "../../db/connection.js";
import { gameStateSnapshots } from "../../db/schema/index.js";
import { newId, now } from "../../utils/id-generator.js";
import type { GameState } from "@rpg-engine/shared";

export function createGameStateStorage(db: DB) {
  return {
    async getLatest(chatId: string) {
      const rows = await db
        .select()
        .from(gameStateSnapshots)
        .where(eq(gameStateSnapshots.chatId, chatId))
        .orderBy(desc(gameStateSnapshots.createdAt))
        .limit(1);
      return rows[0] ?? null;
    },

    async getByMessage(messageId: string, swipeIndex: number = 0) {
      const rows = await db
        .select()
        .from(gameStateSnapshots)
        .where(
          and(
            eq(gameStateSnapshots.messageId, messageId),
            eq(gameStateSnapshots.swipeIndex, swipeIndex),
          ),
        );
      return rows[0] ?? null;
    },

    async create(state: Omit<GameState, "id" | "createdAt">) {
      const id = newId();
      await db.insert(gameStateSnapshots).values({
        id,
        chatId: state.chatId,
        messageId: state.messageId,
        swipeIndex: state.swipeIndex,
        date: state.date,
        time: state.time,
        location: state.location,
        weather: state.weather,
        temperature: state.temperature,
        presentCharacters: JSON.stringify(state.presentCharacters),
        recentEvents: JSON.stringify(state.recentEvents),
        playerStats: state.playerStats ? JSON.stringify(state.playerStats) : null,
        createdAt: now(),
      });
      return id;
    },
  };
}
