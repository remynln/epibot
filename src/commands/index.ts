import type { Command } from '../utils'
import { Login } from './Login'
import { Ping, Pong } from './Ping'
import { Score } from './Score'
import { ScoreBoard } from './ScoreBoard'

export const Commands: Command[] = [Login, Ping, Pong, Score, ScoreBoard]
