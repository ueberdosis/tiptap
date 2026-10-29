import type { ColorDef } from '../../../types/ColorDef.js'
import * as set from 'lib0/set'
import * as random from 'lib0/random'

export const getUserColor = (
  colorMapping: Map<string | null, ColorDef>,
  colors: ColorDef[],
  user: string | null,
) => {
  if (!colorMapping.has(user)) {
    if (colorMapping.size < colors.length) {
      const usedColors = set.create()
      colorMapping.forEach(color => usedColors.add(color))
      colors = colors.filter(color => !usedColors.has(color))
    }
    colorMapping.set(user, random.oneOf(colors))
  }
  const color = colorMapping.get(user)
  if (!color) throw new Error('At least one snapshot color is required')
  return color
}
