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
import { ref, onMounted, inject } from "vue";
import { ref as dbRef, onValue } from "firebase/database";

const search = ref("");
const desserts = ref([]);
const db = inject("db");
const headers = [
  {
    align: "center",
    key: "user",
    sortable: false,
    title: "User Name",
  },
  { key: "dkp", align: "center", title: "DKP" },
];

async function fetchUserName() {
  if (!db) {
    console.error("Database not available");
    return;
  }

  try {
    console.log("Attempting to fetch data from path: dkp/");
    const userRef = dbRef(db, "dkp/");
    return onValue(
      userRef,
      (snapshot) => {
        console.log("Snapshot received:", snapshot.exists(), snapshot.val());
        const data = snapshot.val();
        if (data) {
          console.log("Processing data:", data);
          const processedData = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          console.log("Processed data:", processedData);
          desserts.value = processedData.sort((a, b) =>
            a.user.localeCompare(b.user)
          );
        } else {
          console.log("No data found in snapshot");
          desserts.value = [];
        }
      },
      (error) => {
        console.error("Database read error:", error);
      }
    );
  } catch (error) {
    console.error("Error setting up database listener:", error);
  }
}

onMounted(() => {
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
