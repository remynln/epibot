import axios from 'axios'
import { DateTime } from 'luxon'
import { loged_role, log_chanel, prefix } from '../config'
import { Command, Profile } from '../utils'
import {
  BaseCommandInteraction,
  GuildMember,
  GuildMemberRoleManager,
  Message,
  MessageEmbed,
  User
} from 'discord.js'

export const Login: Command = {
  name: 'login',
  ephemeral: true,
  description: 'give you the roles you deserve',
  options: [
    {
      name: 'login',
      required: true,
      description: 'your epitech address mail',
      type: 'STRING'
    }
  ],
  run: async (client, interaction) => {
    if (
      interaction.member?.roles instanceof GuildMemberRoleManager &&
      interaction.member?.roles.cache.get(loged_role)
    )
      return { content: 'You have already been verrified.' }

    let login: string | undefined

    if (interaction instanceof Message)
      login = interaction.content.slice(prefix.length).trim().split(/ +/g)[1]
    else login = interaction.options.get('login')?.value?.toString()

    if (!login?.match(/\w+.\w+@epitech.eu/))
      return { content: 'Error, please enter valid e-mail' }

    const result = await axios
      .get(
        `https://roslyn.epi.codes/trombi/api.php?version=2&action=profile&q=${login}`
      )
      .then((res) => res.data)
      .catch((err) => err.response.data)

    if (result.status > 400)
      return { content: `Error: ${result.error}, code: ${result.status}` }

    handleRoles(interaction, result.profile)
    return {
      content: `Vous avez été assigné à l'utilisateur **${result.profile.name}** avec succès.\nEn cas d'erreur veuillez contacter un admin`
    }
  }
}

const handleRoles = async (
  interaction: BaseCommandInteraction | Message,
  profile: Profile
) => {
  let promoRole, cityRole

  const campus = profile.city.name
  const promo = parseInt(profile.promo.name, 10)
  const verifiedRole = interaction.guild?.roles.cache.get(loged_role)

  promoRole = interaction.guild?.roles.cache.find(
    ({ name }) => name === `${promo}`
  )
  if (!promoRole)
    promoRole = await interaction.guild?.roles.create({
      hoist: true,
      name: `${promo}`,
      reason: 'new promo'
    })

  if (promo > DateTime.now().plus({ year: 2 }).year) {
    cityRole = interaction.guild?.roles.cache.find(
      ({ name }) => name === campus
    )
    if (!cityRole)
      cityRole = await interaction.guild?.roles.create({
        name: campus,
        reason: 'new campus'
      })
  }

  if (interaction.member instanceof GuildMember) {
    if (cityRole) interaction.member?.roles.add(cityRole)
    if (promoRole) interaction.member?.roles.add(promoRole)
    if (verifiedRole) interaction.member?.roles.add(verifiedRole)
  }

  const author = interaction.member?.user
  const channel = await interaction.guild?.channels.fetch(log_chanel)

  if (channel?.type == 'GUILD_TEXT' && author instanceof User)
    channel.send({
      embeds: [
        new MessageEmbed()
          .setColor('#4169E1')
          .setTimestamp()
          .setThumbnail(author?.avatarURL() ?? '')
          .setTitle(`${author?.username} | ${profile.name}`)
          .setDescription(profile.id)
          .addField('Grades:', `${promo} | ${campus}`, true)
      ]
    })
}
