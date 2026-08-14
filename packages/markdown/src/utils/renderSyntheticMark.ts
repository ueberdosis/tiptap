import type { JSONContent, MarkdownRendererHelpers, RenderContext } from '@tiptap/core'

const PLACEHOLDER = '\uE000__TIPTAP_MARKDOWN_PLACEHOLDER__\uE001'

/**
 * Renders a synthetic mark node around a placeholder so the opening or
 * closing markdown delimiter can be extracted from the output.
 */
export function renderSyntheticMark(
  renderMarkdown: (
    node: JSONContent,
    helpers: MarkdownRendererHelpers,
    ctx: RenderContext,
  ) => string,
  markType: string,
  attrs: Record<string, any>,
  side: 'open' | 'close',
): string {
  const syntheticNode: JSONContent = {
    type: markType,
    attrs,
    content: [{ type: 'text', text: PLACEHOLDER }],
  }

  try {
    const rendered = renderMarkdown(
      syntheticNode,
      {
        renderChildren: () => PLACEHOLDER,
        renderChild: () => PLACEHOLDER,
        indent: content => content,
        wrapInBlock: (prefix, content) => prefix + content,
      },
      { index: 0, level: 0, parentType: 'text', meta: {} },
    )

    const placeholderIndex = rendered.indexOf(PLACEHOLDER)

    if (placeholderIndex < 0) {
      return ''
    }

    if (side === 'open') {
      return rendered.substring(0, placeholderIndex)
    }

    return rendered.substring(placeholderIndex + PLACEHOLDER.length)
  } catch (err) {
    throw new Error(
      `Failed to get mark ${side === 'open' ? 'opening' : 'closing'} for ${markType}: ${err}`,
    )
  }
}
