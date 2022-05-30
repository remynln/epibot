import { Client } from 'discord.js'
import axios from 'axios'
import ready from './listeners/ready'
import message from './listeners/message'
import interactionCreate from './listeners/interactionCreate'

console.log('Bot is starting...')

const client = new Client({
  restSweepInterval: 1000,
  partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION'],
  intents: [
    'DIRECT_MESSAGES',
    'DIRECT_MESSAGE_REACTIONS',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'GUILD_EMOJIS_AND_STICKERS',
    'GUILDS',
    'GUILD_MEMBERS'
  ]
})

ready(client)
message(client)
interactionCreate(client)

client.login(process.env.BOT_TOKEN)
