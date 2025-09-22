<template>
  <v-card class="pa-5" max-width="600" outlined>
    <input type="email" v-model="email" placeholder="Email" />
    <input type="password" v-model="password" placeholder="Password" />
    <button @click="signUp">Sign Up</button>
    <button @click="signIn">Sign In</button>
  </v-card>
</template>

<script setup>
import { ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

const auth = useAuth();
const email = ref("");
const password = ref("");

const signUp = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    console.log("User signed up!");
    // User is now signed up, you can redirect or update UI
  } catch (error) {
    console.error("Error signing up:", error.message);
  }
};

const signIn = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    console.log("User signed in!");
    // User is now signed in
  } catch (error) {
    console.error("Error signing in:", error.message);
  }
};
</script>
