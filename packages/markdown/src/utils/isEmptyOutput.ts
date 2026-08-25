/**
 * Check whether markdown output is empty, ignoring non-breaking space entities.
 * @param markdown The serialized markdown.
 * @returns True when the output has no meaningful content.
 */
export function isEmptyOutput(markdown: string): boolean {
  if (!markdown || markdown.trim() === '') {
    return true
  }

  // Check if the output is only &nbsp; entities or non-breaking space characters
  const cleanedOutput = markdown
    .replace(/&amp;amp;nbsp;/g, '')
    .replace(/&amp;nbsp;/g, '')
    .replace(/&nbsp;/g, '')
    .replace(/\u00A0/g, '')
    .trim()

  return cleanedOutput === ''
}
