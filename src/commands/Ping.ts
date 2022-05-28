import { BaseCommandInteraction, Client, MessageEmbed } from 'discord.js'
import { Command, processTime } from './utils'

export const Ping: Command = {
  name: 'ping',
  description: '...',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const embeds = [
      new MessageEmbed()
        .setTitle(`🏓 Pong`)
        .setImage('https://media.giphy.com/media/xThuWtNFKZWG6fUFe8/giphy.gif')
        .setDescription(`${processTime(interaction.createdAt)} ms`)
    ]

    await interaction.followUp({
      ephemeral: true,
      embeds
    })
  }
}

export const Pong: Command = {
  name: 'pong',
  description: '...',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    if (!interaction.guild?.emojis) await interaction.guild?.fetch()

    const cache = interaction.guild?.emojis?.cache
    const random = Math.floor(Math.random() * (cache?.size ?? 0))
    const content = cache?.at(random)?.toString() ?? 'bruh'

    await interaction.followUp({
      ephemeral: true,
      content
    })
  }
}
