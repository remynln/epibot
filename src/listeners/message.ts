import type { Client, Message } from 'discord.js'
import { Commands } from '../commands'

export const prefix = '!'

export default (client: Client): void => {
  client.on('messageCreate', async (message: Message) => {
    if (message.author.bot) return
    if (message.content.indexOf(prefix) !== 0)
      if (message.channel.id === '799971495618543621')
        message.content = `${prefix}login ${message.content}`
      else return

    handleCommand(client, message)
  })
}

const handleCommand = async (
  client: Client,
  message: Message
): Promise<void> => {
  if (!message.guild?.name) await message.guild?.fetch()

  const args = message.content.slice(prefix.length).trim().split(/ +/g)
  const command = args.shift()?.toLowerCase()

  const slashCommand = Commands.find((c) => c.name === command)
  if (!slashCommand) {
    message.reply({ content: 'An error has occurred' })
    return
  }

  await message.channel.sendTyping()

  const response = await slashCommand.run(client, message)
  await message.reply(response)
}
