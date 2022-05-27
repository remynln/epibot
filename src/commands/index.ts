import type { Command } from './utils'
import { Hello } from './Hello'
import { Ping, Pong } from './Ping'

export const Commands: Command[] = [Hello, Ping, Pong]
