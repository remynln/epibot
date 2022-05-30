import { MessageEmbed } from 'discord.js'
import { Command, processTime } from '../utils'

export const Ping: Command = {
  name: 'ping',
  ephemeral: true,
  description: '...',
  run: async (client, interaction) => {
    return {
      embeds: [
        new MessageEmbed()
          .setTitle(`🏓 Pong`)
          .setImage(
            'https://media.giphy.com/media/xThuWtNFKZWG6fUFe8/giphy.gif'
          )
          .setDescription(`${processTime(interaction.createdAt)}`)
      ]
    }
  }
}

export const Pong: Command = {
  name: 'pong',
  ephemeral: true,
  description: '...',
  run: async (client, interaction) => {
    const cache = interaction.guild?.emojis?.cache
    const random = Math.floor(Math.random() * (cache?.size ?? 0))

    return { content: cache?.at(random)?.toString() ?? 'bruh' }
  }
}
