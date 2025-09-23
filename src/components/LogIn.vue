<template>
  <div>
    <h2>Email/Password Authentication</h2>
    <input type="email" v-model="email" placeholder="Email" />
    <input type="password" v-model="password" placeholder="Password" />
    <button @click="signUp">Sign Up</button>
    <button @click="signIn">Sign In</button>
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
  </div>
</template>

<script>
import { defineComponent, ref, inject } from "vue";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { ref as dbRef, set } from "firebase/database"; // Import for DB access

export default defineComponent({
  name: "LogIn",
  setup() {
    const email = ref("");
    const password = ref("");
    const errorMsg = ref(null);

    // Inject the Firebase Auth and DB instances
    const auth = inject("auth");
    const db = inject("db");
    console.log(db);

    if (!auth || !db) {
      console.error("Firebase Auth or Database not provided!");
      errorMsg.value = "Authentication services not available.";
      return {}; // Return empty if services aren't available
    }

    const signUp = async () => {
      errorMsg.value = null; // Clear previous errors
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.value,
          password.value
        );
        const user = userCredential.user;
        const currentUid = user.uid;
        console.log("User signed up! UID:", currentUid);

        // Store initial user data in Realtime Database
        const userProfileRef = dbRef(db, `users/${currentUid}/profile`);
        await set(userProfileRef, {
          email: user.email,
          createdAt: new Date().toISOString(),
        });
        console.log("User profile created in RTDB.");
      } catch (error) {
        console.error("Error signing up:", error.message);
        errorMsg.value = error.message;
      }
    };

    const signIn = async () => {
      errorMsg.value = null; // Clear previous errors
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        console.log("User signed in!");
      } catch (error) {
        console.error("Error signing in:", error.message);
        errorMsg.value = error.message;
      }
    };

    return { email, password, signUp, signIn, errorMsg };
  },
});
</script>

<style scoped>
.error {
  color: red;
}
</style>
