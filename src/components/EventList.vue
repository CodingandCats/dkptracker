<script setup>
import { ref } from 'vue'
import { Calendar, Users, Award, ExternalLink } from 'lucide-vue-next'
import { firebase } from '../lib/firebase'

defineProps({
  events: Array
})

const emit = defineEmits(['attendance-updated'])

const processingAttendance = ref(false)

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const simulateDiscordAttendance = async (eventId) => {
  processingAttendance.value = true
  
  try {
    // Simulate a Discord user clicking "attend"
    const mockDiscordUser = {
      discord_id: `${Date.now()}`, // Simulate unique Discord ID
      username: `Player${Math.floor(Math.random() * 1000)}`
    }

    // First, create or get the player
    const existingPlayerResult = await firebase
      .from('players')
      .select('*')
      .eq('discord_id', mockDiscordUser.discord_id)
      .single()
    
    const existingPlayer = existingPlayerResult.data

    let playerId
    if (existingPlayer) {
      playerId = existingPlayer.id
    } else {
      const newPlayerResult = await firebase
        .from('players')
        .insert({
          discord_id: mockDiscordUser.discord_id,
          username: mockDiscordUser.username,
          total_dkp: 0
        })

      if (newPlayerResult.error) throw newPlayerResult.error
      playerId = newPlayerResult.data.id
    }

    // Get event details for DKP calculation
    const eventResult = await firebase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()
    
    const event = eventResult.data
    if (!event) throw new Error('Event not found')

    // Record attendance
    const attendanceResult = await firebase
      .from('attendances')
      .insert({
        event_id: eventId,
        player_id: playerId,
        dkp_awarded: event.dkp_reward
      })

    if (attendanceResult.error) throw attendanceResult.error

    // Update player's total DKP
    const updateResult = await firebase
      .from('players')
      .update({
        total_dkp: existingPlayer ? existingPlayer.total_dkp + event.dkp_reward : event.dkp_reward
      })
      .eq('id', playerId)

    if (updateResult.error) throw updateResult.error
    emit('attendance-updated')
  } catch (error) {
    console.error('Error processing attendance:', error)
    alert('Error processing attendance')
  } finally {
    processingAttendance.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="events.length === 0" class="text-center py-12">
      <Calendar class="w-16 h-16 text-slate-400 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-slate-300 mb-2">No Events Yet</h3>
      <p class="text-slate-400">Create your first event to start tracking attendance!</p>
    </div>

    <div v-for="event in events" :key="event.id" class="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
      <div class="p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold text-white mb-2">{{ event.name }}</h3>
            <div class="flex items-center text-slate-300 mb-2">
              <Calendar class="w-4 h-4 mr-2" />
              {{ formatDate(event.date) }}
            </div>
            <p class="text-slate-400">{{ event.description }}</p>
          </div>
          <div class="text-right">
            <div class="flex items-center text-purple-400 mb-2">
              <Award class="w-4 h-4 mr-1" />
              {{ event.dkp_reward }} DKP
            </div>
            <div class="flex items-center text-slate-300">
              <Users class="w-4 h-4 mr-1" />
              {{ event.attendances?.length || 0 }} attending
            </div>
          </div>
        </div>

        <!-- Simulate Discord Bot Button -->
        <div class="border-t border-slate-700 pt-4">
          <button
            @click="simulateDiscordAttendance(event.id)"
            :disabled="processingAttendance"
            class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
          >
            <ExternalLink class="w-4 h-4 mr-2" />
            {{ processingAttendance ? 'Processing...' : 'Simulate Discord "Attend" Click' }}
          </button>
          <p class="text-xs text-slate-400 mt-2">
            This simulates a Discord user clicking the "attend" button in your bot
          </p>
        </div>

        <!-- Attendees List -->
        <div v-if="event.attendances && event.attendances.length > 0" class="mt-4 border-t border-slate-700 pt-4">
          <h4 class="text-sm font-semibold text-slate-300 mb-3">Attendees</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div
              v-for="attendance in event.attendances"
              :key="attendance.id"
              class="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between"
            >
              <span class="text-white font-medium">{{ attendance.players.username }}</span>
              <span class="text-purple-400 text-sm">+{{ event.dkp_reward }} DKP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>