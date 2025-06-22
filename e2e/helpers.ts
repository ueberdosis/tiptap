import type { Page } from '@playwright/test'
import type { Editor } from '@tiptap/core'

export const TIPTAP_SELECTOR = '.tiptap'

export async function runEditor<T = unknown, Args = undefined>(
  page: Page,
  fn: (editor: Editor, args: Args) => T,
  args?: Args,
): Promise<T> {
  return page.locator(TIPTAP_SELECTOR).evaluate(
    (element, data) => {
      // @ts-ignore
      const editor = element.editor as Editor | null
      if (editor) {
        // eslint-disable-next-line no-new-func
        const fnEval = new Function('editor', 'args', `return (${data.fnString})(editor, args)`)
        return fnEval(editor, data.args)
      }
      return undefined
    },
    { fnString: fn.toString(), args },
  ) as Promise<T>
}

export function getEditorHTML(page: Page): Promise<string> {
  return page.locator(TIPTAP_SELECTOR).evaluate((el: HTMLElement) => el.innerHTML)
}
