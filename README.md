# DKP Event Attendance Tracker

A Vue.js application for tracking Discord event attendance and managing DKP (Dragon Kill Points) for gaming guilds.

## Features

- **Event Management**: Create and manage events with customizable DKP rewards
- **Player Tracking**: Automatic player registration and DKP accumulation
- **Discord Integration**: REST API endpoint for Discord bot integration
- **Real-time Updates**: Live attendance tracking and leaderboards
- **Responsive Design**: Beautiful, modern UI that works on all devices

## Setup

1. **Database Setup**: 
   - Click "Connect to Supabase" in the top right to set up your database
   - The database schema will be automatically created

2. **Environment Variables**:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials

3. **Discord Bot Integration**:
   - Use the provided Supabase Edge Function at `/functions/v1/discord-attend`
   - Send POST requests when users click "attend" in Discord

## Discord Bot Integration

Your Discord bot should send POST requests to:
```
https://your-supabase-url.supabase.co/functions/v1/discord-attend
```

With payload:
```json
{
  "event_id": "uuid-of-event-from-your-app",
  "discord_user": {
    "id": "discord_user_id",
    "username": "discord_username"
  }
}
```

## Example Discord Bot Code (Discord.js)

```javascript
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Create event command
const eventCommand = new SlashCommandBuilder()
  .setName('event')
  .setDescription('Create an attendance event')
  .addStringOption(option =>
    option.setName('event_id')
      .setDescription('Event ID from DKP tracker')
      .setRequired(true)
  );

// Handle button interactions
client.on('interactionCreate', async interaction => {
  if (interaction.isButton() && interaction.customId.startsWith('attend_')) {
    const eventId = interaction.customId.replace('attend_', '');
    
    try {
      const response = await fetch('https://your-supabase-url.supabase.co/functions/v1/discord-attend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          event_id: eventId,
          discord_user: {
            id: interaction.user.id,
            username: interaction.user.username
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await interaction.reply({
          content: `✅ ${result.message}\n🏆 DKP Awarded: ${result.dkp_awarded}\n📊 Total DKP: ${result.new_total_dkp}`,
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: `ℹ️ ${result.message}`,
          ephemeral: true
        });
      }
    } catch (error) {
      console.error('Error:', error);
      await interaction.reply({
        content: '❌ Error processing attendance. Please try again.',
        ephemeral: true
      });
    }
  }
});
```

## Tech Stack

- **Frontend**: Vue 3 + Vite
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Icons**: Lucide Vue
- **Backend**: Supabase Edge Functions (Deno)

## Development

```bash
npm run dev
```

## Deployment

The app can be deployed to any static hosting service. Make sure to set up your Supabase project and configure the environment variables.