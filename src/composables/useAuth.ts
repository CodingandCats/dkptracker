// src/composables/useAuth.ts
import { ref, onMounted, inject } from 'vue';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';

const currentUser = ref<User | null>(null);
const authInitialized = ref(false); // To track if the auth state has been initially checked

// This Promise will resolve once the initial auth state is determined
let authReadyResolver: ((value: unknown) => void) | null = null;
const authReady = new Promise(resolve => {
  authReadyResolver = resolve;
});

export function useAuth() {
  const auth = inject<Auth>('auth');

  if (!auth) {
    throw new Error('Firebase Auth not provided via inject!');
  }

  onMounted(() => {
    // Only set up the listener once
    if (!authInitialized.value) {
      onAuthStateChanged(auth, (user: User | null) => {
        currentUser.value = user;
        authInitialized.value = true;
        if (authReadyResolver) {
          authReadyResolver(true); // Resolve the promise once auth state is known
        }
      });
    }
  });

  return {
    currentUser,
    authInitialized,
    authReady, // Expose the promise
  };
}
