import { createApp } from "vue";
import { createVuetify } from "vuetify";
import { DB_KEY } from "./composables/useDatabase";

// import router from "./router/index"; // Assuming you have your router setup here

import "vuetify/styles";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import App from "./App.vue";

// Assuming you've already run: npm install firebase
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyARl2Ai3AP9JPwKeZ-vustpvsC5RNW-YD4",
  authDomain: "dkptracker-6121c.firebaseapp.com",
  databaseURL: "https://dkptracker-6121c-default-rtdb.firebaseio.com",
  projectId: "dkptracker-6121c",
  storageBucket: "dkptracker-6121c.firebasestorage.app",
  messagingSenderId: "1047085462747",
  appId: "1:1047085462747:web:a5b6e403a81f29420fc8fe",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);

const vuetify = createVuetify({
  components,
  directives,
});
const app = createApp(App);
app.provide(DB_KEY, db);
app.provide("auth", auth); // Provide auth to all components

app.use(vuetify);
app.mount("#app");
