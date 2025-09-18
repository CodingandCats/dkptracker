<script setup>
import { ref } from 'vue'
import { Calendar, Award, FileText, Plus } from 'lucide-vue-next'
import { firebase } from '../lib/firebase'

const emit = defineEmits(['event-created'])

const form = ref({
  name: '',
  description: '',
  date: '',
  dkp_reward: 10
})

const creating = ref(false)

const createEvent = async () => {
  if (!form.value.name || !form.value.date) {
    alert('Please fill in all required fields')
    return
  }

  creating.value = true

  try {
    const result = await firebase
      .from('events')
      .insert({
        name: form.value.name,
        description: form.value.description,
        date: form.value.date,
        dkp_reward: form.value.dkp_reward
      })

    if (result.error) throw result.error

    // Reset form
    form.value = {
      name: '',
      description: '',
      date: '',
      dkp_reward: 10
    }

    emit('event-created')
    alert('Event created successfully!')
  } catch (error) {
    console.error('Error creating event:', error)
    alert('Error creating event')
  } finally {
    creating.value = false
  }
}

// Set default date to current date/time
const setDefaultDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  form.value.date = `${year}-${month}-${day}T${hours}:${minutes}`
}

// Set default date on component mount
setDefaultDate()
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4">
          <Plus class="w-8 h-8 text-white" />
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Create New Event</h2>
        <p class="text-slate-400">Set up a new event for Discord attendance tracking</p>
      </div>

      <form @submit.prevent="createEvent" class="space-y-6">
        <!-- Event Name -->
        <div>
          <label class="flex items-center text-sm font-medium text-slate-300 mb-2">
            <FileText class="w-4 h-4 mr-2" />
            Event Name *
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="e.g., Weekly Raid Night"
            class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="flex items-center text-sm font-medium text-slate-300 mb-2">
            <FileText class="w-4 h-4 mr-2" />
            Description
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Optional description of the event..."
            class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
          ></textarea>
        </div>

        <!-- Date and Time -->
        <div>
          <label class="flex items-center text-sm font-medium text-slate-300 mb-2">
            <Calendar class="w-4 h-4 mr-2" />
            Date & Time *
          </label>
          <input
            v-model="form.date"
            type="datetime-local"
            required
            class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <!-- DKP Reward -->
        <div>
          <label class="flex items-center text-sm font-medium text-slate-300 mb-2">
            <Award class="w-4 h-4 mr-2" />
            DKP Reward
          </label>
          <input
            v-model.number="form.dkp_reward"
            type="number"
            min="0"
            step="1"
            class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
          <p class="text-xs text-slate-400 mt-1">Points awarded to each attendee</p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="creating"
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-purple-800 disabled:to-pink-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
        >
          <Plus class="w-5 h-5 mr-2" />
          {{ creating ? 'Creating Event...' : 'Create Event' }}
        </button>
      </form>

      <!-- Integration Info -->
      <div class="mt-8 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
        <h3 class="text-sm font-semibold text-slate-300 mb-2">Discord Bot Integration</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          Once you create an event, you can integrate it with your Discord bot. The bot should send a POST request to 
          <code class="bg-slate-600 px-1 rounded text-slate-300">/api/attend</code> with the event ID and Discord user information 
          when someone clicks the "attend\" button.
        </p>
      </div>
    </div>
  </div>
</template>