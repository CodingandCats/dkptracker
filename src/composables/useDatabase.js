import { inject } from "vue";

export const DB_KEY = Symbol("database");

export function useDatabase() {
  const db = inject(DB_KEY);
  if (!db) {
    throw new Error("Database not provided");
  }
  return db;
}
