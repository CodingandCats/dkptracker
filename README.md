# DKP Event Attendance Tracker (Firebase)

A Vue.js application for tracking Discord event attendance and managing DKP (Dragon Kill Points) for gaming guilds using Firebase Realtime Database.

## Features

- **Event Management**: Create and manage events with customizable DKP rewards
- **Player Tracking**: Automatic player registration and DKP accumulation
- **Discord Integration**: Firebase REST API integration for Discord bots
- **Real-time Updates**: Live attendance tracking and leaderboards
- **Responsive Design**: Beautiful, modern UI that works on all devices

## Setup

1. **Firebase Setup**: 
   - The app is configured to use Firebase Realtime Database at: `https://dkptracker-6121c-default-rtdb.firebaseio.com/`
   - No additional setup required - the database structure will be created automatically

2. **Database Structure**:
   The app will automatically create these collections:
   - `events/` - Event information
   - `players/` - Player profiles and DKP totals
   - `attendances/` - Attendance records linking events and players

3. **Discord Bot Integration**:
   - Use the Firebase REST API directly in your Discord bot
   - Send requests to Firebase when users click "attend" in Discord

## Discord Bot Integration

Your Discord bot can interact directly with Firebase using the REST API:

### Create Attendance Record
POST to: `https://dkptracker-6121c-default-rtdb.firebaseio.com/attendances.json`
```json
{
  "event_id": "event-key-from-firebase",
  "player_id": "player-key-from-firebase", 
  "dkp_awarded": 10,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### Get Events
GET: `https://dkptracker-6121c-default-rtdb.firebaseio.com/events.json`

### Create/Update Player
POST/PATCH: `https://dkptracker-6121c-default-rtdb.firebaseio.com/players.json`

## Example Discord Bot Code (Discord.js with Firebase)

```javascript
const { SlashCommandBuilder } = require('discord.js');

const FIREBASE_URL = 'https://dkptracker-6121c-default-rtdb.firebaseio.com';

async function recordAttendance(eventId, discordUser) {
  try {
    // Get or create player
    const playersResponse = await fetch(`${FIREBASE_URL}/players.json`);
    const players = await playersResponse.json();
    
    let playerId = null;
    let playerData = null;
    
    if (players) {
      const existingPlayer = Object.entries(players).find(([key, player]) => 
        player.discord_id === discordUser.id
      );
      
      if (existingPlayer) {
        playerId = existingPlayer[0];
        playerData = existingPlayer[1];
      }
    }
    
    if (!playerId) {
      // Create new player
      const newPlayerResponse = await fetch(`${FIREBASE_URL}/players.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discord_id: discordUser.id,
          username: discordUser.username,
          total_dkp: 0,
          created_at: new Date().toISOString()
        })
      });
      const result = await newPlayerResponse.json();
      playerId = result.name;
      playerData = { total_dkp: 0 };
    }
    
    // Get event details
    const eventResponse = await fetch(`${FIREBASE_URL}/events/${eventId}.json`);
    const event = await eventResponse.json();
    
    if (!event) throw new Error('Event not found');
    
    // Record attendance
    await fetch(`${FIREBASE_URL}/attendances.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: eventId,
        player_id: playerId,
        dkp_awarded: event.dkp_reward,
        created_at: new Date().toISOString()
      })
    });
    
    // Update player DKP
    const newTotalDkp = playerData.total_dkp + event.dkp_reward;
    await fetch(`${FIREBASE_URL}/players/${playerId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total_dkp: newTotalDkp })
    });
    
    return {
      success: true,
      dkp_awarded: event.dkp_reward,
      new_total_dkp: newTotalDkp
    };
  } catch (error) {
    console.error('Error recording attendance:', error);
    return { success: false, error: error.message };
  }
}

client.on('interactionCreate', async interaction => {
  if (interaction.isButton() && interaction.customId.startsWith('attend_')) {
    const eventId = interaction.customId.replace('attend_', '');
    
    const result = await recordAttendance(eventId, interaction.user);
    
    if (result.success) {
      await interaction.reply({
        content: `✅ Attendance recorded!\n🏆 DKP Awarded: ${result.dkp_awarded}\n📊 Total DKP: ${result.new_total_dkp}`,
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: `❌ Error: ${result.error}`,
        ephemeral: true
      });
    }
  }
});
```

## Tech Stack

- **Frontend**: Vue 3 + Vite
- **Database**: Firebase Realtime Database
- **Styling**: Tailwind CSS
- **Icons**: Lucide Vue
- **Backend**: Firebase REST API

## Development

```bash
npm run dev
```

## Deployment

The app can be deployed to any static hosting service. The Firebase database is already configured and ready to use.