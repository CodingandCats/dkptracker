import { ref, inject } from "vue";
import { onAuthStateChanged } from "firebase/auth";

const currentUser = ref(null);
const authInitialized = ref(false);

let authReadyResolver = null;
const authReady = new Promise((resolve) => {
  authReadyResolver = resolve;
});

export function useAuth() {
  const auth = inject("auth");

  if (!auth) {
    throw new Error("Firebase Auth not provided via inject!");
  }

  // Initialize the auth listener if not already done
  if (!authInitialized.value) {
    onAuthStateChanged(auth, (user) => {
      currentUser.value = user;
      authInitialized.value = true;
      if (authReadyResolver) {
        authReadyResolver(true);
      }
    });
  }

  return {
    auth,
    currentUser,
    authInitialized,
    authReady,
  };
}
