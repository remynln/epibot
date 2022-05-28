import {
  ApplicationCommandOptionChoiceData,
  BaseCommandInteraction,
  Client,
  GuildMemberRoleManager,
  MessageEmbed
} from 'discord.js'
import { campusOptions, Command, processTime } from '../utils'
import Campus from '../CampusCache'

export const Score: Command = {
  name: 'score',
  description: 'display detail for city score',
  type: 'CHAT_INPUT',
  options: [campusOptions],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const campusOption = interaction.options.get('campus')?.value
    let campus: ApplicationCommandOptionChoiceData | undefined

    if (campusOption) {
      campus = campusOptions.choices?.find(
        ({ value }) => value === campusOption
      )
    } else {
      campus = campusOptions.choices?.find(({ name }) => {
        if (interaction.member?.roles instanceof GuildMemberRoleManager)
          return !!interaction.member?.roles.cache.find(
            (role) => role.name === name
          )
        else return interaction.member?.roles.includes(name)
      })
    }

    if (!campus || typeof campus?.value !== 'string') return

    const data = await Campus.getGroup([campus.value])
    const embed = new MessageEmbed()
      .setColor('#4169E1')
      .setTimestamp()
      .setTitle(campus?.name)

    console.log(Campus.error)

    if (Campus.error) {
      embed.setColor('#E16941')
      embed.setDescription(`${Campus.error.status} ${Campus.error.statusText}`)
    } else
      for (const { city, total } of data) {
        const cityName = campusOptions.choices?.find(
          ({ value }) => value === city
        )?.name

        let ascii_per = ''
        let percentage = 0
        const role = interaction.guild?.roles.cache.find(
          (role) => role.name === `${cityName}`
        )

        if (role === undefined) {
          embed.setDescription(`??? / ${total}\n\`[----------]\`, 0.00%`)
        } else {
          percentage = (role.members.size / total) * 100
          for (let n = 0; n < 20; n++)
            if (percentage / 10 > n / 2) ascii_per = ascii_per + '='
          for (let n = ascii_per.length; n < 20; n++)
            ascii_per = ascii_per + '-'
          embed.setDescription(
            `${
              role.members.size
            } / ${total}\n\`[${ascii_per}]\`, ${percentage.toFixed(2)}%`
          )
        }
      }

    await interaction.followUp({
      embeds: [embed.setFooter(`(${processTime(interaction.createdAt)})`)]
    })
  }
}
