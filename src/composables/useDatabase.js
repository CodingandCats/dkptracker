import { ref, inject } from "vue";

const dbInitialized = ref(false);
const dbData = ref(null);

let dbReadyResolver = null;
const dbReady = new Promise((resolve) => {
  dbReadyResolver = resolve;
});

export function useDatabase() {
  const db = inject("db");
  console.log("useDatabase: db instance:", db);

  if (!db) {
    console.error("Firebase Database not provided via inject!");
    return {
      db: null,
      dbData,
      dbInitialized,
      dbReady,
    };
  }

  // Initialize only if needed
  if (!dbInitialized.value) {
    dbInitialized.value = true;
    if (dbReadyResolver) {
      dbReadyResolver(true);
    }
  }

  return {
    db,
    dbData,
    dbInitialized,
    dbReady,
  };
}
