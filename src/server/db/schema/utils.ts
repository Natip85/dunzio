import { sql } from "drizzle-orm";
import {
  pgTableCreator,
  type PgTimestampConfig,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `dunzio_${name}`);

export const timestampSettings: PgTimestampConfig = {
  mode: "date",
  withTimezone: true,
};

export const timeStamp = (key: string) => timestamp(key, timestampSettings);

export const currentTimestamp = sql`CURRENT_TIMESTAMP`;

export const createUpdateTimestamps = {
  createdAt: timestamp("created_at", timestampSettings)
    .default(currentTimestamp)
    .notNull(),
  updatedAt: timestamp("updated_at", timestampSettings).$onUpdate(
    () => new Date(),
  ),
};

export const chars = (key: string) => varchar(key, { length: 500 });
export const userId = (key = "user_id") => chars(key).notNull();
