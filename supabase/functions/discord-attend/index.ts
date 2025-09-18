import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('id, name, dkp_reward')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get or create player
    let { data: player, error: playerSelectError } = await supabaseClient
      .from('players')
      .select('*')
      .eq('discord_id', discord_user.id)
      .single()

    if (playerSelectError && playerSelectError.code !== 'PGRST116') {
      throw playerSelectError
    }

    if (!player) {
      // Create new player
      const { data: newPlayer, error: playerInsertError } = await supabaseClient
        .from('players')
        .insert({
          discord_id: discord_user.id,
          username: discord_user.username,
          total_dkp: 0
        })
        .select()
        .single()

      if (playerInsertError) throw playerInsertError
      player = newPlayer
    } else {
      // Update username if it changed
      if (player.username !== discord_user.username) {
        await supabaseClient
          .from('players')
          .update({ username: discord_user.username })
          .eq('id', player.id)
      }
    }

    // Check if already attending
    const { data: existingAttendance } = await supabaseClient
      .from('attendances')
      .select('id')
      .eq('event_id', event_id)
      .eq('player_id', player.id)
      .single()

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
    const { error: attendanceError } = await supabaseClient
      .from('attendances')
      .insert({
        event_id: event_id,
        player_id: player.id,
        dkp_awarded: event.dkp_reward
      })

    if (attendanceError) throw attendanceError

    // Update player's total DKP
    const { error: updateError } = await supabaseClient
      .from('players')
      .update({
        total_dkp: player.total_dkp + event.dkp_reward
      })
      .eq('id', player.id)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({
        success: true,
        message: `${discord_user.username} successfully registered for ${event.name}`,
        dkp_awarded: event.dkp_reward,
        new_total_dkp: player.total_dkp + event.dkp_reward
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