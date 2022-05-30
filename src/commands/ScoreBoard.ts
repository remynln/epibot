import { MessageEmbed } from 'discord.js'
import { campusOptions, Command, processTime } from '../utils'
import Campus from '../CampusCache'

export const ScoreBoard: Command = {
  name: 'scoreboard',
  description: '...',
  type: 'CHAT_INPUT',
  defaultPermission: false,
  run: async (client, interaction) => {
    const data = await Campus.getGroup()
    const embed = new MessageEmbed()
      .setColor('#4169E1')
      .setTimestamp()
      .setTitle('Scoreboard')

    if (Campus.error && Campus.error.status < 500) {
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
            cityName,
            percentage: ((role?.members.size ?? 0) / total) * 100
          }
        })
        .filter(({ percentage }) => percentage)
        .sort((a, b) => b.percentage - a.percentage)
        .forEach(({ cityName, percentage }) => {
          let ascii_per = ''
          for (let n = 0; n < 10; n++)
            if (percentage / 10 > n) ascii_per = ascii_per + '='
          for (let n = ascii_per.length; n < 10; n++)
            ascii_per = ascii_per + '-'
          embed.addField(
            `${cityName}`,
            `\`[${ascii_per}]\`, ${percentage.toFixed(2)}%`,
            true
          )
        })

    return {
      embeds: [embed.setFooter(`(${processTime(interaction.createdAt)})`)]
    }
  }
}
