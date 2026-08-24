import { Extension } from '@tiptap/editor'

import type { BackgroundColorOptions } from '@tiptap/editor/extensions/background-color'
import { BackgroundColor } from '@tiptap/editor/extensions/background-color'
import type { ColorOptions } from '@tiptap/editor/extensions/color'
import { Color } from '@tiptap/editor/extensions/color'
import type { FontFamilyOptions } from '@tiptap/editor/extensions/font-family'
import { FontFamily } from '@tiptap/editor/extensions/font-family'
import type { FontSizeOptions } from '@tiptap/editor/extensions/font-size'
import { FontSize } from '@tiptap/editor/extensions/font-size'
import type { LineHeightOptions } from '@tiptap/editor/extensions/line-height'
import { LineHeight } from '@tiptap/editor/extensions/line-height'
import type { TextStyleOptions } from '@tiptap/editor/extensions/text-style'
import { TextStyle } from '@tiptap/editor/extensions/text-style'

export interface TextStyleKitOptions {
  /**
   * If set to false, the background color extension will not be registered
   * @example backgroundColor: false
   */
  backgroundColor: Partial<BackgroundColorOptions> | false
  /**
   * If set to false, the color extension will not be registered
   * @example color: false
   */
  color: Partial<ColorOptions> | false
  /**
   * If set to false, the font family extension will not be registered
   * @example fontFamily: false
   */
  fontFamily: Partial<FontFamilyOptions> | false
  /**
   * If set to false, the font size extension will not be registered
   * @example fontSize: false
   */
  fontSize: Partial<FontSizeOptions> | false
  /**
   * If set to false, the line height extension will not be registered
   * @example lineHeight: false
   */
  lineHeight: Partial<LineHeightOptions> | false
  /**
   * If set to false, the text style extension will not be registered (required for other text style extensions)
   * @example textStyle: false
   */
  textStyle: Partial<TextStyleOptions> | false
}

/**
 * The table kit is a collection of table editor extensions.
 *
 * It’s a good starting point for building your own table in Tiptap.
 */
export const TextStyleKit = Extension.create<TextStyleKitOptions>({
  name: 'textStyleKit',

  addExtensions() {
    const extensions = []

    if (this.options.backgroundColor !== false) {
      extensions.push(BackgroundColor.configure(this.options.backgroundColor))
    }

    if (this.options.color !== false) {
      extensions.push(Color.configure(this.options.color))
    }

    if (this.options.fontFamily !== false) {
      extensions.push(FontFamily.configure(this.options.fontFamily))
    }

    if (this.options.fontSize !== false) {
      extensions.push(FontSize.configure(this.options.fontSize))
    }

    if (this.options.lineHeight !== false) {
      extensions.push(LineHeight.configure(this.options.lineHeight))
    }

    if (this.options.textStyle !== false) {
      extensions.push(TextStyle.configure(this.options.textStyle))
    }

    return extensions
  },
})
