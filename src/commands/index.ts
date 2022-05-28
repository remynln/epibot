import type { Command } from '../utils'
import { Hello } from './Hello'
import { Ping, Pong } from './Ping'
import { Score } from './Score'

export const Commands: Command[] = [Hello, Ping, Pong, Score]
