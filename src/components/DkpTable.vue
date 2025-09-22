<template>
  <div class="container">
    <v-card title="The White Order Lineage 2 DKP" class="elevation-2">
      <template v-slot:text>
        <v-text-field
          v-model="search"
          label="Search"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
          width="300"
        ></v-text-field>
      </template>

      <v-data-table
        :headers="headers"
        :items="desserts"
        :search="search"
      ></v-data-table>
    </v-card>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useDatabase } from "@/composables/useDatabase";
import { ref as dbRef, onValue } from "firebase/database"; // Alias 'ref' to avoid conflict with Vue's ref

// const userName = ref("Loading...");
const db = useDatabase();
// const userName = ref("Loading...");

async function fetchUserName() {
  if (db) {
    const userRef = dbRef(db, "dkp/");
    await onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        desserts.value = Object.entries(data)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }))
          .sort((a, b) => a.user.localeCompare(b.user)); // Sort alphabetically by user
      }
    });
  }
}

const search = ref("");
const headers = [
  {
    align: "center",
    key: "user",
    sortable: false,
    title: "User Name",
  },
  { key: "dkp", align: "center", title: "DKP" },
];
const desserts = ref([]);

onMounted(async () => {
  fetchUserName();
});
</script>

<style scoped>
.container {
  max-width: 75vw;
  margin: auto;
  padding: 20px;
  background-color: cornflowerblue;
}
</style>
