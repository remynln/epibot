import type { BaseCommandInteraction, Client, Interaction } from 'discord.js'
import { Commands } from '../commands'

export default (client: Client): void => {
  client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isCommand() || interaction.isContextMenu()) {
      await handleSlashCommand(client, interaction)
    }
  })
}

const handleSlashCommand = async (
  client: Client,
  interaction: BaseCommandInteraction
): Promise<void> => {
  if (!interaction.guild?.name) await interaction.guild?.fetch()

  const slashCommand = Commands.find((c) => c.name === interaction.commandName)
  if (!slashCommand) {
    interaction.followUp({ content: 'An error has occurred' })
    return
  }

  await interaction.deferReply()

  const response = await slashCommand.run(client, interaction)
  await interaction.followUp({
    ephemeral: !!slashCommand.ephemeral,
    ...response
  })
}
