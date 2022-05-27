import type {
  ChatInputApplicationCommandData,
  Client,
  BaseCommandInteraction
} from 'discord.js'
import { DateTime } from 'luxon'

export interface Command extends ChatInputApplicationCommandData {
  run: (client: Client, interaction: BaseCommandInteraction) => void
}

export const processTime = (date: Date) =>
  DateTime.fromISO(date.toISOString()).diff(DateTime.now()).milliseconds
