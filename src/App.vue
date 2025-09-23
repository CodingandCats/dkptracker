<template>
  <v-app>
    <v-app-bar>
      <v-container>
        <span v-if="currentUser">Welcome, {{ currentUser.email }}</span>
        <span v-else>Please sign in</span>
        <v-spacer></v-spacer>
        <v-btn v-if="currentUser" @click="signOutUser">Sign Out</v-btn>
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { useAuth } from "@/composables/useAuth";
import { signOut } from "firebase/auth";
import { useRouter } from "vue-router";

const { auth, currentUser } = useAuth();
const router = useRouter();

const signOutUser = async () => {
  try {
    await signOut(auth);
    router.push("/login");
    console.log("User signed out successfully.");
  } catch (error) {
    console.error("Error signing out:", error.message);
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.error {
  color: red;
  font-weight: bold;
}
</style>
