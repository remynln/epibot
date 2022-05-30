import type { Command } from '../utils'

export const Hello: Command = {
  name: 'hello',
  description: 'Returns a greeting',
  type: 'CHAT_INPUT',
  ephemeral: true,
  run: async () => {
    return {
      content: 'Hello there!'
    }
  }
}
