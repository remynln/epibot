import axios from 'axios'
import {
  ApplicationCommandOptionChoiceData,
  BaseCommandInteraction,
  EmbedFieldData,
  GuildMemberRoleManager,
  MessageEmbed
} from 'discord.js'
import { DateTime } from 'luxon'
import { campusOptions, Command } from '../utils'

export const Schedule: Command = {
  name: 'schedule',
  description: 'Display your campus schedule for the day.',
  options: [
    campusOptions,
    {
      name: 'date',
      description: 'the date to lookup (format day or day/month)',
      type: 'STRING'
    }
  ],
  run: async (client, interaction) => {
    if (!(interaction instanceof BaseCommandInteraction))
      return { content: 'Please use /schedule command instead.' }

    //#region get campus
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
    //#endregion

    //#region get date
    const date = interaction.options.get('date')?.value
    let start: DateTime = DateTime.now()

    if (date && typeof date == 'string') {
      start = DateTime.fromFormat(date, 'd')
      if (!start.isValid) start = DateTime.fromFormat(date, 'd/L')
      if (!start.isValid) start = DateTime.now()
    }
    //#endregion

    const data = await axios
      .get(
        `https://epiroom.vercel.app/api/day.json?location=${
          campus?.value
        }&start=${start.toFormat('yyyy-LL-dd')}`
      )
      .then(({ data }) =>
        data.sort((a: { start: string }, b: { start: string }) =>
          a.start.localeCompare(b.start)
        )
      )

    const fields: EmbedFieldData[] = []
    for (const event of data) {
      const start = DateTime.fromFormat(event.start, 'y-L-d h:m:s')
      const end = DateTime.fromFormat(event.end, 'y-L-d h:m:s')

      fields.push({
        name: `[<t:${start.toUnixInteger()}:t> - <t:${end.toUnixInteger()}:t>]`,
        value: `${event.titlemodule} » ${event.acti_title} — ${
          event.room?.title ?? 'no room asigned'
        }`,
        inline: true
      })
    }

    const length = Math.ceil(fields.length / 25)
    const size = Math.ceil(fields.length / length)
    const embeds = Array.from({ length }, (_, i) =>
      new MessageEmbed()
        .setColor('#4169E1')
        .setTitle(`Planing ${campus?.name} · ${start.toFormat('dd LLL yyyy')}`)
        .setDescription(`(${i + 1}/${length})`)
        .setFields(fields.splice(0, size))
    )

    return { embeds }
  }
}
