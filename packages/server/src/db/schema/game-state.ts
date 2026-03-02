// ──────────────────────────────────────────────
// Schema: Game State Snapshots
// ──────────────────────────────────────────────
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const gameStateSnapshots = sqliteTable("game_state_snapshots", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull(),
  /** FK to messages.id — cascade handled at application level */
  messageId: text("message_id").notNull(),
  swipeIndex: integer("swipe_index").notNull().default(0),

  date: text("date"),
  time: text("time"),
  location: text("location"),
  weather: text("weather"),
  temperature: text("temperature"),

  /** JSON array of PresentCharacter objects */
  presentCharacters: text("present_characters").notNull().default("[]"),
  /** JSON array of recent event strings */
  recentEvents: text("recent_events").notNull().default("[]"),
  /** JSON object for player stats */
  playerStats: text("player_stats"),

  createdAt: text("created_at").notNull(),
});
