import { BaseCommandInteraction, Client, MessageEmbed } from 'discord.js'
import { Command, processTime } from '../utils'

export const Ping: Command = {
  name: 'ping',
  description: '...',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    await interaction.followUp({
      ephemeral: true,
      embeds: [
        new MessageEmbed()
          .setTitle(`🏓 Pong`)
          .setImage(
            'https://media.giphy.com/media/xThuWtNFKZWG6fUFe8/giphy.gif'
          )
          .setDescription(`${processTime(interaction.createdAt)}`)
      ]
    })
  }
}

export const Pong: Command = {
  name: 'pong',
  description: '...',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const cache = interaction.guild?.emojis?.cache
    const random = Math.floor(Math.random() * (cache?.size ?? 0))

    await interaction.followUp({
      ephemeral: true,
      content: cache?.at(random)?.toString() ?? 'bruh'
    })
  }
}
