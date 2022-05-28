import type { Command } from '../utils'
import { Ping, Pong } from './Ping'
import { Score } from './Score'
import { ScoreBoard } from './ScoreBoard'

export const Commands: Command[] = [Ping, Pong, Score, ScoreBoard]
