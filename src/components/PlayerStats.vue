<script setup>
import { Trophy, Award, Calendar } from 'lucide-vue-next'

defineProps({
  players: Array
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="players.length === 0" class="text-center py-12">
      <Trophy class="w-16 h-16 text-slate-400 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-slate-300 mb-2">No Players Yet</h3>
      <p class="text-slate-400">Players will appear here once they start attending events!</p>
    </div>

    <div class="grid gap-6">
      <div v-for="(player, index) in players" :key="player.id" class="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold mr-4">
              {{ index + 1 }}
            </div>
            <div>
              <h3 class="text-xl font-bold text-white">{{ player.username }}</h3>
              <p class="text-slate-400 text-sm">Discord ID: {{ player.discord_id }}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="flex items-center text-yellow-400 mb-1">
              <Award class="w-5 h-5 mr-1" />
              <span class="text-2xl font-bold">{{ player.total_dkp }}</span>
            </div>
            <p class="text-slate-400 text-sm">Total DKP</p>
          </div>
        </div>

        <!-- Attendance History -->
        <div v-if="player.attendances && player.attendances.length > 0" class="border-t border-slate-700 pt-4">
          <div class="flex items-center mb-3">
            <Calendar class="w-4 h-4 text-slate-400 mr-2" />
            <h4 class="text-sm font-semibold text-slate-300">
              Recent Attendance ({{ player.attendances.length }} events)
            </h4>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="attendance in player.attendances.slice(0, 6)"
              :key="attendance.id"
              class="bg-slate-700/50 rounded-lg p-3"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-white font-medium text-sm">{{ attendance.events.name }}</p>
                  <p class="text-slate-400 text-xs">{{ formatDate(attendance.events.date) }}</p>
                </div>
                <span class="text-purple-400 text-sm font-medium">+{{ attendance.dkp_awarded }}</span>
              </div>
            </div>
          </div>
          <div v-if="player.attendances.length > 6" class="text-center mt-3">
            <p class="text-slate-400 text-sm">and {{ player.attendances.length - 6 }} more events...</p>
          </div>
        </div>

        <div v-else class="border-t border-slate-700 pt-4">
          <p class="text-slate-400 text-sm">No attendance history yet</p>
        </div>
      </div>
    </div>
  </div>
</template>