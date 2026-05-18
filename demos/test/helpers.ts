import type { Page } from '@playwright/test'

/**
 * Get the editor element from the page
 * @param page The page to get the editor from
 * @returns The editor element Locator
 */
export async function getEditor(page: Page) {
  const locator = page.locator('.tiptap')
  await locator.waitFor()
  return locator
}

/**
 * Set default content for the editor
 * @param page The page containing the editor
 * @param content The HTML content to set
 */
export async function setEditorContent(page: Page, content: string) {
  const editor = await getEditor(page)
  await editor.evaluate((el: any, innerContent: string) => {
    el.editor.commands.setContent(innerContent)
  }, content)
}

/**
 * Click a button in the editor
 * @param page The page containing the editor
 * @param buttonLabel The label of the button to click
 */
export async function clickButton(page: Page, buttonLabel: string) {
  await page.getByRole('button', { name: buttonLabel }).click()
}
