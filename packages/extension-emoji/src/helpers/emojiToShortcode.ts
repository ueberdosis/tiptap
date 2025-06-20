import { EmojiItem } from '../emoji.js'
import { removeVariationSelector } from './removeVariationSelector.js'

export function emojiToShortcode(emoji: string, emojis: EmojiItem[]): string | undefined {
  return emojis.find(item => item.emoji === removeVariationSelector(emoji))?.shortcodes[0]
}
