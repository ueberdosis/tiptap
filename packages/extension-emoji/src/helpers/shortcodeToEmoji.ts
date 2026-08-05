import type { EmojiItem } from '../emoji.js'

/**
 * Turn a shortcode such as `:smile:` into its emoji character.
 */
export function shortcodeToEmoji(shortcode: string, emojis: EmojiItem[]): EmojiItem | undefined {
  return emojis.find(item => shortcode === item.name || item.shortcodes.includes(shortcode))
}
