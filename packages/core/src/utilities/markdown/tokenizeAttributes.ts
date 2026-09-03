export type AttributeToken =
  | { type: 'class'; name: string }
  | { type: 'id'; name: string }
  | { type: 'keyValue'; name: string; value: string }
  | { type: 'boolean'; name: string }

type AttributeSyntax = 'pandoc' | 'shortcode'

type TokenResult = {
  token?: AttributeToken
  nextIndex: number
}

function isWhitespace(character: string): boolean {
  return /\s/.test(character)
}

function isAsciiLetter(character: string): boolean {
  return /^[a-zA-Z]$/.test(character)
}

function isWordCharacter(character: string): boolean {
  return /^\w$/.test(character)
}

function skipWhitespace(input: string, index: number): number {
  while (index < input.length && isWhitespace(input[index])) {
    index += 1
  }

  return index
}

function skipToWhitespace(input: string, index: number): number {
  while (index < input.length && !isWhitespace(input[index])) {
    index += 1
  }

  return index
}

function readName(input: string, index: number, allowHyphen: boolean): number {
  while (
    index < input.length &&
    (isWordCharacter(input[index]) || (allowHyphen && input[index] === '-'))
  ) {
    index += 1
  }

  return index
}

function readShorthand(input: string, index: number): TokenResult {
  const prefix = input[index]
  const nameStart = index + 1
  const nameEnd = readName(input, nameStart, true)

  if (nameEnd === nameStart) {
    return { nextIndex: skipToWhitespace(input, nameEnd) }
  }

  return {
    token: {
      type: prefix === '.' ? 'class' : 'id',
      name: input.slice(nameStart, nameEnd),
    },
    nextIndex: skipToWhitespace(input, nameEnd),
  }
}

function readQuotedSegment(input: string, index: number): TokenResult {
  const closingQuote = input.indexOf(input[index], index + 1)
  const segmentEnd = closingQuote === -1 ? index : closingQuote + 1

  return { nextIndex: skipToWhitespace(input, segmentEnd) }
}

function readKeyValue(
  input: string,
  name: string,
  index: number,
  allowWhitespace: boolean,
): TokenResult | undefined {
  let valueStart = allowWhitespace ? skipWhitespace(input, index) : index
  if (input[valueStart] !== '=') {
    return undefined
  }

  valueStart = allowWhitespace ? skipWhitespace(input, valueStart + 1) : valueStart + 1
  const quote = input[valueStart]
  if (quote !== '"' && quote !== "'") {
    return undefined
  }

  const valueEnd = input.indexOf(quote, valueStart + 1)
  if (valueEnd === -1) {
    return undefined
  }

  return {
    token: {
      type: 'keyValue',
      name,
      value: input.slice(valueStart + 1, valueEnd),
    },
    nextIndex: skipToWhitespace(input, valueEnd + 1),
  }
}

function readNamedAttribute(input: string, index: number, syntax: AttributeSyntax): TokenResult {
  const isPandoc = syntax === 'pandoc'
  const nameEnd = readName(input, index + 1, isPandoc)
  const name = input.slice(index, nameEnd)
  const keyValue = readKeyValue(input, name, nameEnd, isPandoc)

  if (keyValue) {
    return keyValue
  }

  const isStandalone = nameEnd === input.length || isWhitespace(input[nameEnd])
  return {
    token: isPandoc && isStandalone ? { type: 'boolean', name } : undefined,
    nextIndex: syntax === 'shortcode' ? skipToWhitespace(input, nameEnd) : nameEnd,
  }
}

function readAttribute(input: string, index: number, syntax: AttributeSyntax): TokenResult {
  const prefix = input[index]

  if (syntax === 'pandoc' && (prefix === '.' || prefix === '#')) {
    return readShorthand(input, index)
  }
  if (prefix === '"' || prefix === "'") {
    return readQuotedSegment(input, index)
  }

  const hasValidStart = syntax === 'pandoc' ? isAsciiLetter(prefix) : isWordCharacter(prefix)
  if (hasValidStart) {
    return readNamedAttribute(input, index, syntax)
  }

  return { nextIndex: skipToWhitespace(input, index) }
}

export function tokenizeAttributes(input: string, syntax: AttributeSyntax): AttributeToken[] {
  const tokens: AttributeToken[] = []
  let index = 0

  while (index < input.length) {
    index = skipWhitespace(input, index)
    if (index >= input.length) {
      break
    }

    const result = readAttribute(input, index, syntax)
    if (result.token) {
      tokens.push(result.token)
    }
    index = result.nextIndex
  }

  return tokens
}
