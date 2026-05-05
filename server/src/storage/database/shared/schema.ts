import { pgTable, serial, timestamp, varchar, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const rooms = pgTable(
  "rooms",
  {
    id: serial().primaryKey(),
    room_code: varchar("room_code", { length: 10 }).notNull().unique(),
    location: varchar("location", { length: 100 }).notNull(),
    start_time: timestamp("start_time", { withTimezone: true }).notNull(),
    end_time: timestamp("end_time", { withTimezone: true }),
    creator_name: varchar("creator_name", { length: 50 }).notNull(),
    creator_id: varchar("creator_id", { length: 64 }).notNull(),
    members: jsonb("members").default([]).notNull(),
    is_permanent: boolean("is_permanent").default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("rooms_room_code_idx").on(table.room_code),
    index("rooms_creator_id_idx").on(table.creator_id),
    index("rooms_start_time_idx").on(table.start_time),
  ]
);

export type Room = typeof rooms.$inferSelect;
