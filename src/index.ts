import { Client, Intents } from 'discord.js'
import ready from './listeners/ready'
import interactionCreate from './listeners/interactionCreate'

console.log('Bot is starting...')

const client = new Client({
  intents: Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS
})

ready(client)
interactionCreate(client)

client.login(process.env.BOT_TOKEN)
