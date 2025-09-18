import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AttendRequest {
  event_id: string
  discord_user: {
    id: string
    username: string
  }
}

const FIREBASE_URL = 'https://dkptracker-6121c-default-rtdb.firebaseio.com'

// Helper function to make Firebase REST API calls
async function firebaseRequest(path: string, method: string = 'GET', data?: any) {
  const url = `${FIREBASE_URL}${path}.json`
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }
  
  if (data) {
    options.body = JSON.stringify(data)
  }
  
  const response = await fetch(url, options)
  return await response.json()
}

// Helper function to find record by field value
async function findByField(table: string, field: string, value: string) {
  const data = await firebaseRequest(`/${table}`)
  if (!data) return null
  
  const key = Object.keys(data).find(k => data[k][field] === value)
  return key ? { id: key, ...data[key] } : null
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { event_id, discord_user }: AttendRequest = await req.json()

    if (!event_id || !discord_user?.id || !discord_user?.username) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: event_id, discord_user.id, discord_user.username' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if event exists
    const event = await firebaseRequest(`/events/${event_id}`)
    if (!event) {
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get or create player
    let player = await findByField('players', 'discord_id', discord_user.id)

    if (!player) {
      // Create new player
      const newPlayerData = {
        discord_id: discord_user.id,
        username: discord_user.username,
        total_dkp: 0,
        created_at: new Date().toISOString()
      }
      
      const newPlayerKey = await firebaseRequest('/players', 'POST', newPlayerData)
      player = { id: newPlayerKey.name, ...newPlayerData }
    } else {
      // Update username if it changed
      if (player.username !== discord_user.username) {
        await firebaseRequest(`/players/${player.id}`, 'PATCH', { username: discord_user.username })
        player.username = discord_user.username
      }
    }

    // Check if already attending
    const attendances = await firebaseRequest('/attendances')
    const existingAttendance = attendances ? Object.values(attendances).find((att: any) => 
      att.event_id === event_id && att.player_id === player.id
    ) : null

    if (existingAttendance) {
      return new Response(
        JSON.stringify({ 
          message: 'Already attending this event',
          player: player.username,
          event: event.name
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Record attendance
    const attendanceData = {
      event_id: event_id,
      player_id: player.id,
      dkp_awarded: event.dkp_reward,
      created_at: new Date().toISOString()
    }
    
    await firebaseRequest('/attendances', 'POST', attendanceData)

    // Update player's total DKP
    const newTotalDkp = player.total_dkp + event.dkp_reward
    await firebaseRequest(`/players/${player.id}`, 'PATCH', { total_dkp: newTotalDkp })

    return new Response(
      JSON.stringify({
        success: true,
        message: `${discord_user.username} successfully registered for ${event.name}`,
        dkp_awarded: event.dkp_reward,
        new_total_dkp: newTotalDkp
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing attendance:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})