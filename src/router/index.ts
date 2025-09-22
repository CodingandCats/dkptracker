// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuth } from '../composables/useAuth'; // Import your auth composable

import DkpTable from '../components/DkpTable.vue'; // Example views
import Login from '../components/LogIn.vue';

const routes: Array<RouteRecordRaw> = [

  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DkpTable,
    meta: { requiresAuth: true } // <--- Mark this route as protected
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
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

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !currentUser.value) {
    // If the route requires auth and the user is NOT logged in, redirect to login page
    console.log("Redirecting to login. Requires auth but user is null.");
    next({ name: 'Login' });
  } else if ((to.name === 'Login' || to.name === 'Register') && currentUser.value) {
    // If user is logged in and trying to access login/register page, redirect to home/dashboard
    console.log("Redirecting from login/register. User is already logged in.");
    next({ name: 'Dashboard' }); // Or a suitable authenticated landing page
  } else {
    // Otherwise, allow navigation
    next();
  }
});


export default router;
