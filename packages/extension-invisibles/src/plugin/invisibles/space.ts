import { characterFn } from '../utils'

const isSpace = (char: string) => char === ' '

export const space = () => characterFn('space')(isSpace)
