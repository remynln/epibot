import { BaseCommandInteraction, Client, MessageEmbed } from 'discord.js'
import { campusOptions, Command, processTime } from '../utils'
import Campus from '../CampusCache'

export const ScoreBoard: Command = {
  name: 'scoreboard',
  description: '...',
  type: 'CHAT_INPUT',
  defaultPermission: false,
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const data = await Campus.getGroup()
    const embed = new MessageEmbed()
      .setColor('#4169E1')
      .setTimestamp()
      .setTitle('Scoreboard')

    if (Campus.error) {
      embed.setColor('#E16941')
      embed.setDescription(`${Campus.error.status} ${Campus.error.statusText}`)
    } else
      data
        .map(({ city, total }) => {
          const cityName = campusOptions.choices?.find(
            ({ value }) => value === city
          )?.name
          const role = interaction.guild?.roles.cache.find(
            (role) => role.name === `${cityName}`
          )

          return {
            city,
            percentage: ((role?.members.size ?? 0) / total) * 100
          }
        })
        .filter(({ percentage }) => percentage)
        .sort((a, b) => b.percentage - a.percentage)
        .forEach(({ city, percentage }) => {
          let ascii_per = ''
          for (let n = 0; n < 10; n++)
            if (percentage / 10 > n) ascii_per = ascii_per + '='
          for (let n = ascii_per.length; n < 10; n++)
            ascii_per = ascii_per + '-'
          embed.addField(
            `${city}`,
            `\`[${ascii_per}]\`, ${percentage.toFixed(2)}%`,
            true
          )
        })

    await interaction.followUp({
      embeds: [embed.setFooter(`(${processTime(interaction.createdAt)})`)]
    })
  }
}
