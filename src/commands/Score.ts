import {
  BaseCommandInteraction,
  Client,
  GuildMemberRoleManager,
  MessageEmbed
} from 'discord.js'
import { campusOptions, Command, processTime } from '../utils'

export const Score: Command = {
  name: 'score',
  description: 'display detail for city score',
  type: 'CHAT_INPUT',
  options: [campusOptions],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    let city: { name: string; value?: unknown } | null | undefined =
      interaction.options.get('campus')

    if (!city) {
      city = campusOptions.choices?.find(({ name }) => {
        if (interaction.member?.roles instanceof GuildMemberRoleManager)
          return !!interaction.member?.roles.cache.find(
            (role) => role.name === name
          )
        else return interaction.member?.roles.includes(name)
      })
    }

    if (!city) return

    const embed = new MessageEmbed()
      .setColor('#4169E1')
      .setTimestamp()
      .setTitle(city.name)

    await interaction.followUp({
      embeds: [embed.setFooter(`(${processTime(interaction.createdAt)} ms)`)]
    })
  }
}
