import type { EmojiItem } from '../emoji.js'
import { removeVariationSelector } from './removeVariationSelector.js'

/**
 * Turn an emoji character into its shortcode, such as `:smile:`.
 */
export function emojiToShortcode(emoji: string, emojis: EmojiItem[]): string | undefined {
  return emojis.find(item => item.emoji === removeVariationSelector(emoji))?.shortcodes[0]
}
