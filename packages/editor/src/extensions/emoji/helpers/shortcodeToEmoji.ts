import type { EmojiItem } from '../emoji.js'

export function shortcodeToEmoji(shortcode: string, emojis: EmojiItem[]): EmojiItem | undefined {
  return emojis.find(item => shortcode === item.name || item.shortcodes.includes(shortcode))
}
