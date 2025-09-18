<script setup>
import { ref, onMounted } from 'vue'
import EventList from './components/EventList.vue'
import PlayerStats from './components/PlayerStats.vue'
import CreateEvent from './components/CreateEvent.vue'
import { firebase } from './lib/firebase'

const activeTab = ref('events')
const events = ref([])
const players = ref([])
const loading = ref(true)

const fetchEvents = async () => {
  try {
    // Get events
    const eventsResult = await firebase.from('events').select('*').order('created_at', { ascending: false })
    if (eventsResult.error) throw eventsResult.error
    
    // Get attendances and players for each event
    const eventsWithAttendances = await Promise.all(
      (eventsResult.data || []).map(async (event) => {
        const attendancesResult = await firebase.from('attendances').select('*').eq('event_id', event.id)
        const attendances = attendancesResult.data || []
        
        // Get player info for each attendance
        const attendancesWithPlayers = await Promise.all(
          attendances.map(async (attendance) => {
            const playerResult = await firebase.from('players').select('*').eq('id', attendance.player_id).single()
            return {
              ...attendance,
              players: playerResult.data || {}
            }
          })
        )
        
        return {
          ...event,
          attendances: attendancesWithPlayers
        }
      })
    )
    
    events.value = eventsWithAttendances
  } catch (error) {
    console.error('Error fetching events:', error)
  }
}

const fetchPlayers = async () => {
  try {
    // Get players
    const playersResult = await firebase.from('players').select('*').order('total_dkp', { ascending: false })
    if (playersResult.error) throw playersResult.error
    
    // Get attendances for each player
    const playersWithAttendances = await Promise.all(
      (playersResult.data || []).map(async (player) => {
        const attendancesResult = await firebase.from('attendances').select('*').eq('player_id', player.id)
        const attendances = attendancesResult.data || []
        
        // Get event info for each attendance
        const attendancesWithEvents = await Promise.all(
          attendances.map(async (attendance) => {
            const eventResult = await firebase.from('events').select('*').eq('id', attendance.event_id).single()
            return {
              ...attendance,
              events: eventResult.data || {}
            }
          })
        )
        
        return {
          ...player,
          attendances: attendancesWithEvents
        }
      })
    )
    
    players.value = playersWithAttendances
  } catch (error) {
    console.error('Error fetching players:', error)
  }
}

const loadData = async () => {
  loading.value = true
  await Promise.all([fetchEvents(), fetchPlayers()])
  loading.value = false
}

onMounted(() => {
  loadData()
})

const handleEventCreated = () => {
  loadData()
}

const handleAttendanceUpdate = () => {
  loadData()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">
          DKP Event Tracker
        </h1>
        <p class="text-slate-300">
          Track Discord event attendance and manage DKP points
        </p>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex justify-center mb-8">
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-lg p-1 border border-slate-700">
          <button
            @click="activeTab = 'events'"
            :class="[
              'px-6 py-2 rounded-md font-medium transition-all duration-200',
              activeTab === 'events'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            ]"
          >
            Events
          </button>
          <button
            @click="activeTab = 'players'"
            :class="[
              'px-6 py-2 rounded-md font-medium transition-all duration-200',
              activeTab === 'players'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            ]"
          >
            Players
          </button>
          <button
            @click="activeTab = 'create'"
            :class="[
              'px-6 py-2 rounded-md font-medium transition-all duration-200',
              activeTab === 'create'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            ]"
          >
            Create Event
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>

      <!-- Tab Content -->
      <div v-else>
        <EventList
          v-if="activeTab === 'events'"
          :events="events"
          @attendance-updated="handleAttendanceUpdate"
        />
        <PlayerStats
          v-if="activeTab === 'players'"
          :players="players"
        />
        <CreateEvent
          v-if="activeTab === 'create'"
          @event-created="handleEventCreated"
        />
      </div>
    </div>
  </div>
</template>