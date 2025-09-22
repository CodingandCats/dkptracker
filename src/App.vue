// src/App.vue
<template>
  <div id="app">
    <nav>
      <!-- Display user info if available -->
      <span v-if="currentUser"
        >Welcome, {{ currentUser.email }} (UID: {{ currentUser.uid }})</span
      >
      <span v-else>Please sign in</span>
      <v-btn v-if="currentUser" @click="signOutUser">Sign Out</v-btn>
    </nav>
    <hr />
    <LogIn />
    <hr />
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import { onAuthStateChanged, signOut } from "firebase/auth"; // Import signOut

import LogIn from "./components/LogIn.vue";
import { useAuth } from "./composables/useAuth";

export default defineComponent({
  name: "App",
  components: {
    LogIn,
  },

  setup() {
    const currentUser = ref(); // reactive ref to store the current user
    let unsubscribeAuth = null; // To clean up the listener

    const auth = useAuth();

    if (!auth) {
      console.error("Firebase Auth not provided!");
      // Handle error, maybe display a global message
      return {};
    }

    onMounted(() => {
      // Listen for auth state changes
      unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        currentUser.value = user; // Update the reactive user state
        if (user) {
          console.log("Auth state changed: User is signed in. UID:", user.uid);
          // You can now use user.uid throughout your app via currentUser.value.uid
        } else {
          console.log("Auth state changed: User is signed out.");
        }
      });
    });

    onUnmounted(() => {
      if (unsubscribeAuth) {
        unsubscribeAuth(); // Clean up the listener when the component is unmounted
      }
    });

    const signOutUser = async () => {
      try {
        await signOut(auth);
        console.log("User signed out successfully.");
      } catch (error) {
        console.error("Error signing out:", error.message);
      }
    };

    return {
      currentUser,
      signOutUser,
    };
  },
});
</script>

<style>
/* Basic styling */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
nav {
  margin-bottom: 20px;
}
button {
  margin: 5px;
  padding: 8px 15px;
  cursor: pointer;
}
input {
  margin: 5px;
  padding: 8px;
}
hr {
  margin: 30px 0;
}
.error {
  color: red;
  font-weight: bold;
}
</style>
