/** Text alignment for words that a keyboard rewrites, measured in UTF-16 units like document positions. */

const isHighSurrogate = (code: number) => code >= 0xd800 && code <= 0xdbff

const isLowSurrogate = (code: number) => code >= 0xdc00 && code <= 0xdfff

const reverseText = (text: string) => text.split('').reverse().join('')

/** Returns the length of the longest common subsequence of `oldText` and each prefix of `newText`. */
function commonLengthsByPrefix(oldText: string, newText: string): number[] {
  let lengths: number[] = Array.from({ length: newText.length + 1 }, () => 0)

  // Read UTF-16 units like document positions, so emoji halves line up
  for (const character of oldText.split('')) {
    const next = [0]

    for (let index = 1; index <= newText.length; index += 1) {
      next[index] =
        character === newText[index - 1]
          ? lengths[index - 1] + 1
          : Math.max(lengths[index], next[index - 1])
    }
    lengths = next
  }

  return lengths
}

/** Moves `end` past letters of `oldText` that a correction only moved, like `teh` to `the`. */
function skipMovedLetters(oldText: string, newText: string, end: number, missing: number): number {
  let movedEnd = end

  while (
    movedEnd < newText.length &&
    movedEnd - end < missing &&
    oldText.includes(newText[movedEnd])
  ) {
    movedEnd += 1
  }

  return movedEnd
}

/** Returns how much of `newText` holds the letters of `oldText`, or `null` when they share none. */
function findAlignedLength(oldText: string, newText: string): number | null {
  const lengths = commonLengthsByPrefix(oldText, newText)
  const common = lengths[newText.length]

  if (!common) {
    return null
  }

  return skipMovedLetters(oldText, newText, lengths.indexOf(common), oldText.length - common)
}

/** Finds where `oldText` ends inside its rewritten `newText`, or `null` when they share no characters. */
export function findRewrittenEnd(oldText: string, newText: string): number | null {
  const end = findAlignedLength(oldText, newText)

  // Never split an emoji between its two UTF-16 halves
  return end !== null && isHighSurrogate(newText.charCodeAt(end - 1)) ? end + 1 : end
}

/** Finds where `oldText` starts inside its rewritten `newText`, aligning both from their ends. */
export function findRewrittenStart(oldText: string, newText: string): number | null {
  const length = findAlignedLength(reverseText(oldText), reverseText(newText))

  if (length === null) {
    return null
  }

  const start = newText.length - length

  return isLowSurrogate(newText.charCodeAt(start)) ? start - 1 : start
}

/** Counts the leading characters that `insertedText` shares with `deletedText`. */
export function findRestoredLength(deletedText: string, insertedText: string): number {
  let length = 0

  while (length < deletedText.length && deletedText[length] === insertedText[length]) {
    length += 1
  }

  return isHighSurrogate(insertedText.charCodeAt(length - 1)) ? length - 1 : length
}
