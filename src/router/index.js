// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "../composables/useAuth"; // Import your auth composable

// Example views - make sure these exist or adjust paths

import LogIn from "../components/LogIn.vue";
import DkpTable from "../components/DkpTable.vue";
const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/dkp-table",
    name: "dkp-table",
    component: DkpTable,
    meta: { requiresAuth: true }, // <--- Mark this route as protected
  },
  {
    path: "/log-in",
    name: "login",
    component: LogIn,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/dkp-table",
  },
  // ... other routes
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const { currentUser, authInitialized, authReady } = useAuth();

  // Wait until Firebase Auth has initialized and determined the initial user state
  if (!authInitialized.value) {
    await authReady; // Wait for the auth state to be known
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !currentUser.value) {
    // If the route requires auth and the user is NOT logged in, redirect to login page
    console.log("Redirecting to login. Requires auth but user is null.");
    next({ name: "login" });
  } else if (to.name === "login" && currentUser.value) {
    // If user is logged in and trying to access login/register page, redirect to home/dashboard
    console.log("Redirecting from login/register. User is already logged in.");
    next({ name: "dkp-table" }); // Or a suitable authenticated landing page
  } else {
    // Otherwise, allow navigation
    next();
  }
});

export default router;
