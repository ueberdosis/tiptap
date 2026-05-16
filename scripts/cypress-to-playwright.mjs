#!/usr/bin/env node
/* eslint-disable */
/**
 * Cypress → Playwright spec translator.
 *
 * Reads a .spec.js (or .spec.ts) Cypress test that uses the Cypress patterns
 * employed in this monorepo's demos and produces an equivalent Playwright
 * `.spec.ts` file using the helpers in `tests/e2e/support`.
 *
 * The translator is regex-based and tailored to the patterns inventoried
 * across the repo. It does not pretend to be a general-purpose Cypress
 * compiler — it handles only what we actually use. See TT-376.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')

const HELPER_IMPORT = `import { editorEval, expect, getEditorHTML, getEditorJSON, getEditorText, pasteIntoEditor, pressShortcut, setEditorContent, test, typeInEditor, typeText, waitForEditor, withEditor } from '<HELPER_PATH>'`

const PLAYWRIGHT_SHOULDS = new Map([
  // .should('exist') → expect(locator).toHaveCount(>=1)
])

/** Compute the relative import path from a spec to tests/e2e/support. */
function helperImport(specPath) {
  const supportPath = path.join(REPO_ROOT, 'tests/e2e/support/index.ts')
  let rel = path.relative(path.dirname(specPath), path.dirname(supportPath)).replace(/\\/g, '/')
  if (!rel.startsWith('.')) {
    rel = './' + rel
  }
  return HELPER_IMPORT.replace('<HELPER_PATH>', rel + '/index.js')
}

/**
 * Convert a Cypress selector chain like `cy.get('.tiptap').find('strong')`
 * into a Playwright selector string compatible with `page.locator(...)`.
 * Handles only static `cy.get('SEL')` followed by `.find('SEL')`.
 */
function combineSelectors(getSel, findSel) {
  return `${getSel} ${findSel}`
}

/** Convert `.eq(N)` Cypress accessor into `.nth(N)` Playwright. */
function eqToNth(s) {
  return s.replace(/\.eq\((\d+)\)/g, '.nth($1)')
}

/** Translate a single .should('...') invocation into expect/assertion code.
 *  Returns an awaited Playwright statement using `expect(loc)` where `loc`
 *  is the Playwright locator JS expression passed in.
 */
function alreadyDisambiguated(locExpr) {
  return /\.(first|last|nth)\([^)]*\)\s*$/.test(locExpr)
}

function actionLoc(locExpr) {
  return alreadyDisambiguated(locExpr) ? locExpr : `${locExpr}.first()`
}

function translateShould(locExpr, shouldArgs) {
  // shouldArgs is the raw inside of should(...) — split it carefully respecting strings
  const args = splitArgs(shouldArgs)
  const head = stripQuotes(args[0])
  const rest = args.slice(1)
  const val = rest[0]
  const val2 = rest[1]
  // Cypress matches "at least one element" semantics across most
  // assertions, while Playwright's `expect(locator).X()` enforces strict
  // mode against multiple matches. Anchor most assertions to `.first()`
  // to keep behaviour aligned and avoid spurious strict-mode failures.
  switch (head) {
    case 'exist':
      // `should('exist')` only requires at least one matching element.
      return `await expect(${locExpr}.first()).toBeAttached()`
    case 'not.exist':
      return `await expect(${locExpr}).toHaveCount(0)`
    case 'be.visible':
      return `await expect(${locExpr}.first()).toBeVisible()`
    case 'not.be.visible':
      return `await expect(${locExpr}.first()).toBeHidden()`
    case 'be.checked':
      return `await expect(${locExpr}.first()).toBeChecked()`
    case 'not.be.checked':
      return `await expect(${locExpr}.first()).not.toBeChecked()`
    case 'be.disabled':
      return `await expect(${locExpr}.first()).toBeDisabled()`
    case 'be.enabled':
      return `await expect(${locExpr}.first()).toBeEnabled()`
    case 'contain':
      // `should('contain', X)` passes when any matched element contains
      // the substring. Filter by hasText and assert at least one match.
      return `await expect(${locExpr}.filter({ hasText: ${val} }).first()).toBeAttached()`
    case 'not.contain':
      return `await expect(${locExpr}.first()).not.toContainText(${val})`
    case 'have.text':
      return `await expect(${locExpr}.first()).toHaveText(${val})`
    case 'not.have.text':
      return `await expect(${locExpr}.first()).not.toHaveText(${val})`
    case 'have.length':
      return `await expect(${locExpr}).toHaveCount(${val})`
    case 'have.class':
      return `await expect(${locExpr}.first()).toHaveClass(new RegExp('(^|\\\\s)' + ${val} + '(\\\\s|$)'))`
    case 'not.have.class':
      return `await expect(${locExpr}.first()).not.toHaveClass(new RegExp('(^|\\\\s)' + ${val} + '(\\\\s|$)'))`
    case 'have.attr':
      if (val2 !== undefined) {
        return `await expect(${locExpr}.first()).toHaveAttribute(${val}, ${val2})`
      }
      return `await expect(${locExpr}.first()).toHaveAttribute(${val}, /.*/)`
    case 'not.have.attr':
      if (val2 !== undefined) {
        return `await expect(${locExpr}.first()).not.toHaveAttribute(${val}, ${val2})`
      }
      return `await expect(${locExpr}.first()).not.toHaveAttribute(${val}, /.*/)`
    case 'have.value':
      return `await expect(${locExpr}.first()).toHaveValue(${val})`
    case 'have.css':
      return `await expect(${locExpr}.first()).toHaveCSS(${val}, ${val2})`
    case 'be.empty':
      return `await expect(${locExpr}.first()).toBeEmpty()`
    case 'contain.text':
      return `await expect(${locExpr}.filter({ hasText: ${val} }).first()).toBeAttached()`
    case 'contain.html':
      return `expect(await ${locExpr}.first().innerHTML()).toContain(${val})`
    case 'not.contain.html':
      return `expect(await ${locExpr}.first().innerHTML()).not.toContain(${val})`
    case 'not.contain.text':
      return `await expect(${locExpr}.first()).not.toContainText(${val})`
    case 'have.descendants':
      return `await expect(${locExpr}.first().locator(${val})).toBeAttached()`
    case 'not.have.descendants':
      return `await expect(${locExpr}.locator(${val})).toHaveCount(0)`
    case 'be.called':
      return `// be.called assertion dropped during migration`
    case 'eq':
      return `expect((await ${locExpr}.count())).toBe(${val})`
    default:
      return `// TODO(playwright-migration): unhandled should('${head}', ...) on ${locExpr}`
  }
}

function stripQuotes(s) {
  if (!s) {
    return ''
  }
  const t = s.trim()
  if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
    return t.slice(1, -1)
  }
  return t
}

/** Split a comma-separated argument list while respecting strings/brackets. */
function splitArgs(src) {
  const out = []
  let depth = 0
  let inStr = false
  let strCh = ''
  let cur = ''
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    const prev = src[i - 1]
    if (inStr) {
      cur += c
      if (c === strCh && prev !== '\\') {
        inStr = false
      }
      continue
    }
    if (c === "'" || c === '"' || c === '`') {
      inStr = true
      strCh = c
      cur += c
      continue
    }
    if (c === '(' || c === '[' || c === '{') {
      depth++
      cur += c
      continue
    }
    if (c === ')' || c === ']' || c === '}') {
      depth--
      cur += c
      continue
    }
    if (c === ',' && depth === 0) {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += c
  }
  if (cur.trim() !== '') {
    out.push(cur.trim())
  }
  return out
}

/**
 * Find the matching closing brace of a `{` or paren at index i (which must
 * be `(` or `{` or `[`). Returns the index of the matching closer.
 */
function findMatching(src, openIdx) {
  const pairs = { '(': ')', '{': '}', '[': ']' }
  const open = src[openIdx]
  const close = pairs[open]
  if (!close) {
    throw new Error('not an opener: ' + open)
  }
  let depth = 0
  let inStr = false
  let strCh = ''
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i]
    const prev = src[i - 1]
    if (inStr) {
      if (c === strCh && prev !== '\\') {
        inStr = false
      }
      continue
    }
    if (c === "'" || c === '"' || c === '`') {
      inStr = true
      strCh = c
      continue
    }
    if (c === open) {
      depth++
    } else if (c === close) {
      depth--
      if (depth === 0) {
        return i
      }
    }
  }
  return -1
}

/** Tokenise a single chained Cypress statement into its method calls. */
function splitChain(src) {
  // Split on '.' at depth 0, respecting strings/brackets.
  const parts = []
  let depth = 0
  let inStr = false
  let strCh = ''
  let cur = ''
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    const prev = src[i - 1]
    if (inStr) {
      cur += c
      if (c === strCh && prev !== '\\') {
        inStr = false
      }
      continue
    }
    if (c === "'" || c === '"' || c === '`') {
      inStr = true
      strCh = c
      cur += c
      continue
    }
    if (c === '(' || c === '[' || c === '{') {
      depth++
      cur += c
      continue
    }
    if (c === ')' || c === ']' || c === '}') {
      depth--
      cur += c
      continue
    }
    if (c === '.' && depth === 0 && cur !== '') {
      parts.push(cur)
      cur = ''
      continue
    }
    cur += c
  }
  if (cur !== '') {
    parts.push(cur)
  }
  return parts
}

/** Parse a `name(args)` segment. Returns { name, args, rest }. */
function parseCall(segment) {
  const m = segment.match(/^([A-Za-z_$][\w$]*)/)
  if (!m) {
    return null
  }
  const name = m[1]
  const after = segment.slice(name.length)
  if (after[0] !== '(') {
    return { name, args: null, rest: after }
  }
  const close = findMatching(after, 0)
  if (close < 0) {
    return null
  }
  return { name, args: after.slice(1, close), rest: after.slice(close + 1) }
}

/** Translate a chained Cypress expression that begins with cy.<root>. */
function translateChain(chain, indent) {
  const segments = splitChain(chain)
  if (segments.length === 0) {
    return chain
  }
  // First segment may be `cy.get(...)`, `cy.visit(...)`, `cy.window()`,
  // `cy.wait(N)`, `cy.wrap(x)`, `cy.stub(...)`.
  const first = segments[0]
  const second = segments[1]
  if (first !== 'cy' || !second) {
    return chain
  }
  const head = parseCall(second)
  if (!head) {
    return chain
  }

  if (head.name === 'visit') {
    return `await page.goto(${head.args})`
  }
  if (head.name === 'wait') {
    return `await page.waitForTimeout(${head.args})`
  }
  if (head.name === 'window') {
    return `// TODO(playwright-migration): cy.window().then(...)`
  }
  if (head.name === 'stub') {
    return `// TODO(playwright-migration): cy.stub(...)`
  }
  if (head.name === 'wrap') {
    // cy.wrap(val).should('have.text', X)  => expect(val).toBe... not really, often used with arbitrary values
    const after = segments.slice(2)
    if (after.length === 1) {
      const ps = parseCall(after[0])
      if (ps && ps.name === 'should') {
        const args = splitArgs(ps.args)
        const head2 = stripQuotes(args[0])
        if (head2 === 'have.text') {
          return `expect(${head.args}.textContent).toBe(${args[1]})`
        }
        if (head2 === 'eq' || head2 === 'equal') {
          return `expect(${head.args}).toBe(${args[1]})`
        }
      }
    }
    return `// TODO(playwright-migration): cy.wrap(${head.args}) chain`
  }

  if (head.name !== 'get') {
    return chain
  }

  // Build selector by walking subsequent segments collecting .find() / .eq()
  // / .contains() into selector or actions.
  let selector = head.args
  // Cypress accepts jQuery pseudo-selectors like `:first`, `:last`, `:eq(N)`
  // and `:visible` that Playwright does not. Strip them and convert to chain
  // methods.
  let selectorSuffix = ''
  const firstMatch = /(.+):first(.*)/.exec(stripQuotes(selector))
  if (firstMatch) {
    selector = `'${firstMatch[1]}${firstMatch[2]}'`
    selectorSuffix = '.first()'
  }
  const lastMatch = /(.+):last(.*)/.exec(stripQuotes(selector))
  if (lastMatch) {
    selector = `'${lastMatch[1]}${lastMatch[2]}'`
    selectorSuffix = '.last()'
  }
  let locExpr = `page.locator(${selector})${selectorSuffix}`
  let i = 2
  const out = []
  while (i < segments.length) {
    const call = parseCall(segments[i])
    if (!call) {
      i++
      continue
    }
    const { name, args } = call
    if (name === 'find') {
      // Compose into a locator chain. Strip jQuery pseudo-selectors
      // (`:first`, `:last`) that Playwright's CSS engine rejects.
      let sub = args
      const cleaned = stripQuotes(sub).replace(/:first\b/g, '').replace(/:last\b/g, '')
      let extra = ''
      if (/:first\b/.test(stripQuotes(sub))) {
        extra = '.first()'
      }
      if (/:last\b/.test(stripQuotes(sub))) {
        extra = '.last()'
      }
      if (extra) {
        // Re-quote with the original quote style.
        const quote = sub.trim().startsWith('"') ? '"' : "'"
        sub = `${quote}${cleaned}${quote}`
      }
      locExpr = `${locExpr}.locator(${sub})${extra}`
      i++
      continue
    }
    if (name === 'first') {
      locExpr = `${locExpr}.first()`
      i++
      continue
    }
    if (name === 'last') {
      locExpr = `${locExpr}.last()`
      i++
      continue
    }
    if (name === 'eq') {
      locExpr = `${locExpr}.nth(${args})`
      i++
      continue
    }
    if (name === 'parent') {
      locExpr = `${locExpr}.locator('..')`
      i++
      continue
    }
    if (name === 'contains') {
      const a = splitArgs(args)
      if (a.length === 1) {
        locExpr = `${locExpr}.filter({ hasText: ${a[0]} })`
      } else if (a.length === 2) {
        // contains(selector, text)
        locExpr = `${locExpr}.locator(${a[0]}).filter({ hasText: ${a[1]} })`
      }
      i++
      continue
    }
    if (name === 'click') {
      // options like { force: true } we ignore (Playwright clicks default to actionability checks; if needed, force:true)
      let opts = args ? args.trim() : ''
      let clickOpts = ''
      if (opts) {
        // Map { force: true } and { force: false } and similar
        if (/force\s*:\s*true/.test(opts)) {
          clickOpts = '{ force: true }'
        } else if (/multiple\s*:/.test(opts)) {
          clickOpts = ''
        }
      }
      out.push(`await ${actionLoc(locExpr)}.click(${clickOpts})`)
      i++
      continue
    }
    if (name === 'dblclick') {
      out.push(`await ${actionLoc(locExpr)}.dblclick()`)
      i++
      continue
    }
    if (name === 'type') {
      const a = splitArgs(args)
      out.push(`await ${actionLoc(locExpr)}.click()\n${indent}await typeText(page, ${a[0]})`)
      i++
      continue
    }
    if (name === 'trigger') {
      const a = splitArgs(args)
      const ev = stripQuotes(a[0])
      if (ev === 'keydown' && a[1]) {
        const optsExpr = a[1]
        // `cy.trigger('keydown', ...)` dispatches the event without focusing
        // the element, so the editor's current selection is preserved.
        out.push(`await pressShortcut(page, ${optsExpr})`)
      } else {
        out.push(`// TODO(playwright-migration): trigger(...)`)
      }
      i++
      continue
    }
    if (name === 'select') {
      out.push(`await ${actionLoc(locExpr)}.selectOption(${args})`)
      i++
      continue
    }
    if (name === 'focus') {
      out.push(`await ${actionLoc(locExpr)}.focus()`)
      i++
      continue
    }
    if (name === 'blur') {
      out.push(`await ${actionLoc(locExpr)}.blur()`)
      i++
      continue
    }
    if (name === 'check') {
      out.push(`await ${actionLoc(locExpr)}.check()`)
      i++
      continue
    }
    if (name === 'uncheck') {
      out.push(`await ${actionLoc(locExpr)}.uncheck()`)
      i++
      continue
    }
    if (name === 'clear') {
      out.push(`await ${actionLoc(locExpr)}.clear()`)
      i++
      continue
    }
    if (name === 'paste') {
      out.push(`await pasteIntoEditor(page, ${args})`)
      i++
      continue
    }
    if (name === 'invoke') {
      // `.invoke('attr', 'src')` → await loc.getAttribute('src')
      // `.invoke('text')` → await loc.innerText()
      const a = splitArgs(args)
      const fn = stripQuotes(a[0])
      const cont = segments.slice(i + 1)
      let next = cont[0] ? parseCall(cont[0]) : null
      let value = null
      if (fn === 'attr' && a[1]) {
        value = `await ${locExpr}.first().getAttribute(${a[1]})`
      } else if (fn === 'text') {
        value = `(await ${locExpr}.first().innerText())`
      } else if (fn === 'val') {
        value = `await ${locExpr}.first().inputValue()`
      } else {
        out.push(`// TODO(playwright-migration): unhandled .invoke(${args}) on ${locExpr}`)
        i++
        continue
      }
      if (next && next.name === 'should') {
        // Compose with the following should() into a single expect.
        const sargs = splitArgs(next.args)
        const head = stripQuotes(sargs[0])
        const v = sargs[1]
        if (head === 'eq' || head === 'equal') {
          out.push(`expect(${value}).toBe(${v})`)
          i += 2
          continue
        }
        if (head === 'contain' || head === 'include') {
          out.push(`expect(${value}).toContain(${v})`)
          i += 2
          continue
        }
        if (head === 'match') {
          out.push(`expect(${value}).toMatch(${v})`)
          i += 2
          continue
        }
      }
      out.push(`/* invoke('${fn}') value */ ${value}`)
      i++
      continue
    }
    if (name === 'its') {
      // `.its('length')` → await loc.count(); `.its('foo')` → unsupported.
      const prop = stripQuotes(args)
      if (prop === 'length') {
        const cont = segments.slice(i + 1)
        const next = cont[0] ? parseCall(cont[0]) : null
        const value = `(await ${locExpr}.count())`
        if (next && next.name === 'should') {
          const sargs = splitArgs(next.args)
          const head = stripQuotes(sargs[0])
          const v = sargs[1]
          if (head === 'eq' || head === 'equal') {
            out.push(`expect(${value}).toBe(${v})`)
            i += 2
            continue
          }
          if (head === 'be.greaterThan' || head === 'be.gt') {
            out.push(`expect(${value}).toBeGreaterThan(${v})`)
            i += 2
            continue
          }
        }
        out.push(`/* its('length') value */ ${value}`)
        i++
        continue
      }
      out.push(`// TODO(playwright-migration): unhandled .its(${args}) on ${locExpr}`)
      i++
      continue
    }
    if (name === 'should') {
      out.push(translateShould(locExpr, args))
      i++
      continue
    }
    if (name === 'wait') {
      out.push(`await page.waitForTimeout(${args})`)
      i++
      continue
    }
    if (name === 'then') {
      // Bail: cy.get(SEL).then(([{ editor }]) => { ... }) is best handled by replacing the chain
      // with awaited withEditor calls. We emit a TODO marker; the post-processor handles common cases.
      out.push(`// TODO(playwright-migration): .then() chain on locator`)
      i++
      continue
    }
    if (name === 'as') {
      out.push(`// TODO(playwright-migration): .as(${args}) alias`)
      i++
      continue
    }
    out.push(`// TODO(playwright-migration): unhandled .${name}(...) on ${locExpr}`)
    i++
  }
  if (out.length === 0) {
    return `${locExpr}`
  }
  return out.join(`\n${indent}`)
}

/**
 * Top-level translator. Operates line-by-line for simple statements but is
 * aware of multi-line `.then(([{ editor }]) => { ... })` blocks which we
 * translate as `await page.evaluate(...)`-style calls via `withEditor`.
 */
function translate(source) {
  let s = source

  // Strip Cypress reference directives.
  s = s.replace(/^\/\/\/\s*<reference[^>]*>\s*\n/gm, '')

  // Replace `context(` and standalone `describe(` with `test.describe(`.
  s = s.replace(/\bcontext\(/g, 'test.describe(')
  s = s.replace(/(?<!test\.)\bdescribe\(/g, 'test.describe(')

  // `it(` → `test(` with async ({ page }) injection
  s = s.replace(/\bit\(\s*('[^']*'|"[^"]*"|`[^`]*`)\s*,\s*(async\s*)?\(\)\s*=>\s*\{/g,
    "test($1, async ({ page }) => {")
  s = s.replace(/\bit\(\s*('[^']*'|"[^"]*"|`[^`]*`)\s*,\s*function\s*\(\)\s*\{/g,
    "test($1, async ({ page }) => {")

  // beforeEach(() => { ... }) → test.beforeEach(async ({ page }) => { ... })
  s = s.replace(/\bbeforeEach\(\s*\(\)\s*=>\s*\{/g, 'test.beforeEach(async ({ page }) => {')
  s = s.replace(/\bbeforeEach\(\s*function\s*\(\)\s*\{/g, 'test.beforeEach(async ({ page }) => {')
  s = s.replace(/\bafterEach\(\s*\(\)\s*=>\s*\{/g, 'test.afterEach(async ({ page }) => {')
  s = s.replace(/\bbefore\(\s*\(\)\s*=>\s*\{/g, 'test.beforeAll(async ({ page }) => {')
  s = s.replace(/\bafter\(\s*\(\)\s*=>\s*\{/g, 'test.afterAll(async ({ page }) => {')

  // Translate `cy.get('.tiptap').then(([{ editor }]) => { BODY })` blocks first.
  s = translateEditorThenBlocks(s)

  // Translate cy.get('.tiptap').then(elements => { ... }) blocks (DOM access)
  s = translateGetThenBlocks(s)

  // Translate cy.window().then(win => { ... }) blocks: stub prompt etc.
  s = translateWindowThenBlocks(s)

  // Now translate per-statement chains. Walk line-by-line, gathering
  // statements that may span multiple lines but end with `)` plus newline.
  s = translateLineChains(s)

  // Replace expect(...).to.eq / not.eq etc. (chai → jest-style)
  s = translateChaiAssertions(s)

  // Fix bare `editor.X()` calls in nested closures
  s = translateBareEditorCalls(s)

  // Convert `ARR.forEach(NAME => {` blocks that contain `await` into
  // sequential `for (const NAME of ARR) {` blocks so the awaits run.
  s = convertForEachToForOf(s)

  return s
}

function convertForEachToForOf(src) {
  // Find every `<expr>.forEach(<param[, index]> => {` and, if the body
  // contains `await`, rewrite the construct as a sequential for…of loop.
  const regex = /(\S[\w\.\[\]'"`]*?)\.forEach\(\s*\(?([\w,\s]+)\)?\s*=>\s*\{/g
  let out = ''
  let lastIndex = 0
  let m
  while ((m = regex.exec(src)) !== null) {
    const [match, arr, paramRaw] = m
    const params = paramRaw.split(',').map(s => s.trim()).filter(Boolean)
    const braceStart = m.index + match.length - 1
    const braceEnd = findMatching(src, braceStart)
    if (braceEnd < 0) {
      continue
    }
    const body = src.slice(braceStart + 1, braceEnd)
    const after = src.slice(braceEnd + 1)
    const closeParen = after.match(/^\s*\)/)
    if (!closeParen) {
      continue
    }
    if (!/\bawait\b/.test(body)) {
      out += src.slice(lastIndex, braceEnd + 1 + closeParen[0].length)
      lastIndex = braceEnd + 1 + closeParen[0].length
      regex.lastIndex = lastIndex
      continue
    }
    out += src.slice(lastIndex, m.index)
    if (params.length === 1) {
      out += `for (const ${params[0]} of ${arr}) {${body}}`
    } else {
      const [value, index] = params
      out += `let __i = 0\n  for (const ${value} of ${arr}) {\n    const ${index} = __i++\n${body}}`
    }
    lastIndex = braceEnd + 1 + closeParen[0].length
    regex.lastIndex = lastIndex
  }
  out += src.slice(lastIndex)
  return out
}

function translateEditorThenBlocks(src) {
  // Find all occurrences of cy.get(SEL).then((args) => { body }) where args destructures editor.
  // Pattern: cy.get('selector').then(([{ editor }]) => { ... })
  let out = ''
  let i = 0
  while (i < src.length) {
    const start = src.indexOf('cy.get(', i)
    if (start === -1) {
      out += src.slice(i)
      break
    }
    out += src.slice(i, start)
    // parse cy.get(...)
    const openParen = start + 'cy.get'.length
    const closeParen = findMatching(src, openParen)
    if (closeParen < 0) {
      out += src.slice(start)
      break
    }
    const selectorArg = src.slice(openParen + 1, closeParen)
    let cursor = closeParen + 1
    // Skip whitespace, look for .then(
    const after = src.slice(cursor)
    const thenMatch = after.match(/^(\s*)\.then\(/)
    if (!thenMatch) {
      out += src.slice(start, cursor)
      i = cursor
      continue
    }
    const thenParenStart = cursor + thenMatch[0].length - 1
    const thenParenEnd = findMatching(src, thenParenStart)
    if (thenParenEnd < 0) {
      out += src.slice(start, cursor)
      i = cursor
      continue
    }
    const thenInner = src.slice(thenParenStart + 1, thenParenEnd)
    // Expect arrow: (args) => { body }
    const arrowMatch = thenInner.match(/^\s*(async\s+)?\(?([^)]*?)\)?\s*=>\s*\{/)
    if (!arrowMatch) {
      out += src.slice(start, thenParenEnd + 1)
      i = thenParenEnd + 1
      continue
    }
    const params = arrowMatch[2].trim()
    // Find body inside the arrow
    const bodyStart = thenInner.indexOf('{', arrowMatch.index + arrowMatch[0].length - 1)
    const bodyOpen = thenInner.indexOf('{', arrowMatch[0].lastIndexOf('{') )
    // Actually easier: find first { after the matched arrow position.
    const arrowEnd = arrowMatch[0].length
    const braceStart = thenInner.indexOf('{', arrowEnd - 1)
    if (braceStart < 0) {
      out += src.slice(start, thenParenEnd + 1)
      i = thenParenEnd + 1
      continue
    }
    const braceEnd = findMatching(thenInner, braceStart)
    if (braceEnd < 0) {
      out += src.slice(start, thenParenEnd + 1)
      i = thenParenEnd + 1
      continue
    }
    const body = thenInner.slice(braceStart + 1, braceEnd)
    const trailing = thenInner.slice(braceEnd + 1).trim() // usually empty or ", )"

    // Decide whether this is an editor-destructuring `then`.
    const editorBlock = /\[\s*\{\s*editor\s*\}\s*\]/.test(params)
    const indent = leadingIndent(out)

    if (editorBlock) {
      const innerIndent = indent + '  '
      const translatedBody = translateEditorBody(body, innerIndent, selectorArg)
      out += `${translatedBody}`
    } else {
      // Non-editor `then`: emit placeholder for downstream handling
      out += `cy.get(${selectorArg}).then(${thenInner})`
    }

    i = thenParenEnd + 1
    // Skip trailing newline / semicolons / closing chain
    // If immediately followed by ')' wrappers from outer chain, leave them alone.
  }
  return out
}

function translateGetThenBlocks(src) {
  // Lightweight pass: replace `cy.get('SEL').then(els => { BODY })` with a
  // safe placeholder that uses `page.locator(SEL).all()`. The body is kept
  // as a line-commented block so the file still parses while highlighting
  // the spot for a hand-tweak.
  let out = ''
  let i = 0
  while (i < src.length) {
    const start = src.indexOf('cy.get(', i)
    if (start === -1) {
      out += src.slice(i)
      break
    }
    out += src.slice(i, start)
    const openParen = start + 'cy.get'.length
    const closeParen = findMatching(src, openParen)
    if (closeParen < 0) {
      out += src.slice(start)
      break
    }
    const selectorArg = src.slice(openParen + 1, closeParen)
    let cursor = closeParen + 1
    const after = src.slice(cursor)
    const thenMatch = after.match(/^(\s*)\.then\(/)
    if (!thenMatch) {
      out += src.slice(start, cursor)
      i = cursor
      continue
    }
    const thenParenStart = cursor + thenMatch[0].length - 1
    const thenParenEnd = findMatching(src, thenParenStart)
    if (thenParenEnd < 0) {
      out += src.slice(start, cursor)
      i = cursor
      continue
    }
    const thenInner = src.slice(thenParenStart + 1, thenParenEnd)
    const commented = thenInner.split('\n').map(l => `// ${l}`).join('\n')
    out += `// TODO(playwright-migration): translate cy.get(${selectorArg}).then(arrow): \n${commented}`
    i = thenParenEnd + 1
  }
  return out
}

function translateWindowThenBlocks(src) {
  // Best-effort: find every `cy.window().then(<arrow>)` block, parse the
  // contained body, and rewrite the whole expression.
  let out = ''
  let i = 0
  while (i < src.length) {
    const start = src.indexOf('cy.window()', i)
    if (start === -1) {
      out += src.slice(i)
      break
    }
    out += src.slice(i, start)
    // Expect `.then(`
    const after = src.slice(start + 'cy.window()'.length)
    const thenMatch = after.match(/^\s*\.then\(/)
    if (!thenMatch) {
      // Could also be cy.window().its('prompt').should('be.called') — skip handling here.
      out += 'cy.window()'
      i = start + 'cy.window()'.length
      continue
    }
    const thenParenStart = start + 'cy.window()'.length + thenMatch[0].length - 1
    const thenParenEnd = findMatching(src, thenParenStart)
    if (thenParenEnd < 0) {
      out += src.slice(start)
      break
    }
    const thenInner = src.slice(thenParenStart + 1, thenParenEnd)
    // Parse arrow: (winName) => { body }   or async (winName) => { ... }
    // Also accept destructuring patterns like ({ document }) — for those
    // we bail out with a structured TODO and skip the block.
    const simpleArrow = thenInner.match(/^\s*(async\s+)?\(?(\w+)\)?\s*=>\s*\{/)
    if (!simpleArrow) {
      const commented = thenInner.split('\n').map(l => `// ${l}`).join('\n')
      out += `// TODO(playwright-migration): translate cy.window().then(arrow):\n${commented}`
      i = thenParenEnd + 1
      continue
    }
    const winName = simpleArrow[2]
    const arrowMatch = simpleArrow
    const braceStart = thenInner.indexOf('{', arrowMatch[0].length - 1)
    const braceEnd = findMatching(thenInner, braceStart)
    if (braceEnd < 0) {
      out += src.slice(start, thenParenEnd + 1)
      i = thenParenEnd + 1
      continue
    }
    const body = thenInner.slice(braceStart + 1, braceEnd)
    const translatedBody = translateWindowBody(body, winName)
    out += translatedBody
    i = thenParenEnd + 1
  }
  return out
}

function translateWindowBody(body, winName) {
  // Replace `cy.stub(win, 'prompt').returns(EXPR)` → installPromptStub
  // and `cy.stub(win, 'prompt', () => EXPR)` similarly.
  // For more complex stubs we emit a TODO comment but keep the body in scope
  // so the surrounding test still compiles.
  let s = body

  // Strip simple returns()-style stub installations.
  s = s.replace(
    new RegExp(`(?:const\\s+\\w+\\s*=\\s*)?cy\\.stub\\(\\s*${winName}\\s*,\\s*'prompt'\\s*\\)\\.returns\\(([\\s\\S]*?)\\)`, 'g'),
    (m, val) => `await page.evaluate((v) => { (window as any).prompt = () => v }, ${val})`,
  )

  // Stub with inline () => EXPR (single expression — no body).
  s = s.replace(
    new RegExp(`(?:const\\s+\\w+\\s*=\\s*)?cy\\.stub\\(\\s*${winName}\\s*,\\s*'prompt'\\s*,\\s*\\(\\)\\s*=>\\s*([^,)]+?)\\s*\\)`, 'g'),
    (m, val) => `await page.evaluate((v) => { (window as any).prompt = () => v }, ${val})`,
  )

  // Any remaining cy.stub on win.* is unsupported — leave a TODO.
  s = s.replace(
    new RegExp(`cy\\.stub\\(\\s*${winName}\\s*[\\s\\S]*?\\)\\s*`, 'g'),
    m => `/* TODO(playwright-migration): ${m.replace(/\*\//g, '* /')} */ `,
  )

  // cy.window().its('prompt').should('be.called') → drop (call assertion
  // can't be cheaply mirrored).
  s = s.replace(/cy\.window\(\)\.its\([^)]*\)\.should\([^)]*\)/g, '/* prompt was called (assertion dropped during migration) */')

  return s
}

function leadingIndent(text) {
  const last = text.lastIndexOf('\n')
  if (last < 0) {
    return ''
  }
  const tail = text.slice(last + 1)
  const m = tail.match(/^(\s*)/)
  return m ? m[1] : ''
}

/**
 * Convert a body of `cy.get('.tiptap').then(([{ editor }]) => { BODY })`.
 * We support these idioms inside BODY:
 *   - `editor.commands.setContent(EXPR)`        → setEditorContent(page, EXPR)
 *   - `expect(editor.getHTML()).to.eq(EXPR)`    → expect(await getEditorHTML(page)).toBe(EXPR)
 *   - `expect(editor.getJSON()).to.deep.eq(X)`  → expect(await getEditorJSON(page)).toEqual(X)
 *   - `editor.destroy()`                        → no-op (page navigation kills the editor)
 *   - free-form `cy.get(...)` chains            → translated via translateLineChains
 *   - everything else                           → fallback `withEditor`
 */
function translateEditorBody(body, indent, selectorArg) {
  // First, merge multi-line statements (chains that span multiple lines, or
  // multi-line argument lists) into single-line statements. We only merge
  // when the running statement is unbalanced (open paren) OR the next line
  // is a leading-dot continuation. This makes per-statement matching below
  // robust against formatting.
  const rawLines = body.split('\n')
  const merged = []
  for (let i = 0; i < rawLines.length; i++) {
    let buf = rawLines[i]
    while (
      i + 1 < rawLines.length
      && (
        parenDepth(buf) > 0
        || /^\s*\./.test(rawLines[i + 1])
      )
    ) {
      i++
      buf += ' ' + rawLines[i].trim()
    }
    merged.push(buf)
  }

  const out = []
  for (const raw of merged) {
    const line = raw.trimEnd()
    const trimmed = line.trim().replace(/;\s*$/, '')
    if (!trimmed) {
      out.push(line)
      continue
    }

    // editor.commands.setContent(X)
    let m = trimmed.match(/^editor\.commands\.setContent\((.*)\)$/)
    if (m) {
      out.push(`${indent}await setEditorContent(page, ${m[1]})`)
      continue
    }
    // expect(editor.getHTML()).to.eq(X)  /  .toBe(X) post-chai-rewrite
    m = trimmed.match(/^expect\(editor\.getHTML\(\)\)\.to\.eq\((.*)\)$/)
    if (m) {
      out.push(`${indent}expect(await getEditorHTML(page)).toBe(${m[1]})`)
      continue
    }
    m = trimmed.match(/^expect\(editor\.getJSON\(\)\)\.to\.deep\.eq\((.*)\)$/)
    if (m) {
      out.push(`${indent}expect(await getEditorJSON(page)).toEqual(${m[1]})`)
      continue
    }
    m = trimmed.match(/^expect\(editor\.getText\(\)\)\.to\.eq\((.*)\)$/)
    if (m) {
      out.push(`${indent}expect(await getEditorText(page)).toBe(${m[1]})`)
      continue
    }
    if (/^editor\.destroy\(\)/.test(trimmed)) {
      continue
    }

    // Generic `expect(editor.X).to.<assertion>(Y)` → expect(await editorEval(...)).<jest>(Y)
    m = trimmed.match(/^expect\(\s*(editor\.[\s\S]+?)\s*\)\.to\.(deep\.eq|deep\.equal|eq|equal|be\.true|be\.false|be\.null|be\.undefined|not\.eq|not\.equal|include|contain|not\.include|not\.contain|have\.length|have\.lengthOf)\(?([^)]*)\)?$/)
    if (m) {
      const expr = m[1]
      const assertion = m[2]
      const arg = m[3]
      const wrapped = `expect(await editorEval(page, ${JSON.stringify(expr)}, ${selectorArg}))`
      switch (assertion) {
        case 'deep.eq':
        case 'deep.equal':
          out.push(`${indent}${wrapped}.toEqual(${arg})`)
          continue
        case 'eq':
        case 'equal':
          out.push(`${indent}${wrapped}.toBe(${arg})`)
          continue
        case 'not.eq':
        case 'not.equal':
          out.push(`${indent}${wrapped}.not.toBe(${arg})`)
          continue
        case 'be.true':
          out.push(`${indent}${wrapped}.toBe(true)`)
          continue
        case 'be.false':
          out.push(`${indent}${wrapped}.toBe(false)`)
          continue
        case 'be.null':
          out.push(`${indent}${wrapped}.toBeNull()`)
          continue
        case 'be.undefined':
          out.push(`${indent}${wrapped}.toBeUndefined()`)
          continue
        case 'include':
        case 'contain':
          out.push(`${indent}${wrapped}.toContain(${arg})`)
          continue
        case 'not.include':
        case 'not.contain':
          out.push(`${indent}${wrapped}.not.toContain(${arg})`)
          continue
        case 'have.length':
        case 'have.lengthOf':
          out.push(`${indent}${wrapped}.toHaveLength(${arg})`)
          continue
        default:
          break
      }
    }

    // Bare `editor....` chain or call — run inside page.evaluate.
    if (/^editor\b/.test(trimmed)) {
      const stmt = trimmed.replace(/\s+/g, ' ')
      out.push(`${indent}await waitForEditor(page, ${selectorArg})`)
      out.push(`${indent}await page.evaluate((__expr) => {`)
      out.push(`${indent}  const editor = (document.querySelector(${selectorArg}) as any).editor`)
      out.push(`${indent}  ${stmt}`)
      out.push(`${indent}}, undefined)`)
      continue
    }

    // const x = editor.X()
    m = trimmed.match(/^(const|let|var)\s+(\w+)\s*=\s*(editor\.[\s\S]+)$/)
    if (m) {
      const kw = m[1]
      const name = m[2]
      const expr = m[3]
      out.push(`${indent}${kw} ${name} = await editorEval(page, ${JSON.stringify(expr)}, ${selectorArg})`)
      continue
    }

    // cy.X(...) — passthrough; translator's line pass handles it.
    if (/^cy\./.test(trimmed)) {
      out.push(`${indent}${trimmed}`)
      continue
    }
    // Plain JS — preserve.
    out.push(line)
  }
  return out.join('\n')
}

function translateLineChains(src) {
  // Walk lines, find statements starting with `cy.` and translate them.
  // Multi-line chains: we collect until matching parens close and until
  // there are no more leading-dot continuation lines.
  const lines = src.split('\n')
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const m = line.match(/^(\s*)(cy\.[\s\S]*)$/)
    if (!m) {
      out.push(line)
      i++
      continue
    }
    const indent = m[1]
    let buf = m[2]
    // First, ensure paren depth is balanced.
    while (parenDepth(buf) > 0 && i + 1 < lines.length) {
      i++
      buf += '\n' + lines[i].trim()
    }
    // Then keep absorbing chained continuation lines (start with `.method`).
    while (i + 1 < lines.length) {
      const next = lines[i + 1]
      if (!/^\s*\./.test(next)) {
        break
      }
      i++
      buf += '\n' + lines[i].trim()
      while (parenDepth(buf) > 0 && i + 1 < lines.length) {
        i++
        buf += '\n' + lines[i].trim()
      }
    }
    // Strip trailing comma/semicolon
    const trailing = buf.match(/[;,]\s*$/) ? buf.match(/[;,]\s*$/)[0] : ''
    const core = trailing ? buf.slice(0, -trailing.length) : buf
    const translated = translateChain(core.replace(/\s+/g, ' '), indent)
    out.push(`${indent}${translated}`)
    i++
  }
  return out.join('\n')
}

function parenDepth(text) {
  let depth = 0
  let inStr = false
  let strCh = ''
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    const prev = text[i - 1]
    if (inStr) {
      if (c === strCh && prev !== '\\') {
        inStr = false
      }
      continue
    }
    if (c === "'" || c === '"' || c === '`') {
      inStr = true
      strCh = c
      continue
    }
    if (c === '(' || c === '[' || c === '{') {
      depth++
    } else if (c === ')' || c === ']' || c === '}') {
      depth--
    }
  }
  return depth
}

function translateBareEditorCalls(src) {
  // Convert leftover `editor.getHTML()` / `editor.getJSON()` / `editor.getText()`
  // calls that escaped the structured editor-then translation. They appear
  // in nested closures (forEach/map). We replace them with helper calls.
  //
  // Skip occurrences inside string literals — `editorEval(page, 'editor.X()')`
  // already routes the call through the browser context.
  const replacements = [
    [/editor\.getHTML\(\)/g, '(await getEditorHTML(page))'],
    [/editor\.getJSON\(\)/g, '(await getEditorJSON(page))'],
    [/editor\.getText\(\)/g, '(await getEditorText(page))'],
    [/editor\.commands\.setContent\(/g, 'await setEditorContent(page, '],
  ]
  let s = replaceOutsideStrings(src, replacements)
  // `.to.not.include(X)` → `).not.toContain(X)` — safe everywhere.
  s = s.replace(/\)\.to\.not\.include\(/g, ').not.toContain(')
  return s
}

function replaceOutsideStrings(src, replacements) {
  // Walk the source and apply each regex on the regions that are NOT
  // inside a single/double/backtick string. Quoted strings are passed
  // through verbatim. Comments are not handled specially.
  let out = ''
  let i = 0
  const n = src.length
  while (i < n) {
    const ch = src[i]
    if (ch === "'" || ch === '"' || ch === '`') {
      let j = i + 1
      while (j < n) {
        if (src[j] === '\\') {
          j += 2
          continue
        }
        if (src[j] === ch) {
          j += 1
          break
        }
        j += 1
      }
      out += src.slice(i, j)
      i = j
      continue
    }
    // Find the next quote char so we know how far to apply replacements.
    let next = i
    while (next < n && src[next] !== "'" && src[next] !== '"' && src[next] !== '`') {
      next += 1
    }
    let chunk = src.slice(i, next)
    for (const [re, replacement] of replacements) {
      chunk = chunk.replace(re, replacement)
    }
    out += chunk
    i = next
  }
  return out
}

function translateChaiAssertions(src) {
  // expect(X).to.eq(Y)   → expect(X).toBe(Y)
  // expect(X).to.equal(Y)→ expect(X).toBe(Y)
  // expect(X).to.deep.eq(Y) → expect(X).toEqual(Y)
  // expect(X).to.deep.equal(Y) → expect(X).toEqual(Y)
  // expect(X).to.not.eq(Y) → expect(X).not.toBe(Y)
  // expect(X).to.be.greaterThan(Y) → expect(X).toBeGreaterThan(Y)
  // expect(X).to.not.equal(Y) → expect(X).not.toBe(Y)
  // expect(X).to.have.length(Y) → expect(X).toHaveLength(Y)
  // expect(X).to.include(Y) → expect(X).toContain(Y)
  let s = src
  s = s.replace(/\)\.to\.deep\.(eq|equal)\(/g, ').toEqual(')
  s = s.replace(/\)\.to\.(eq|equal)\(/g, ').toBe(')
  s = s.replace(/\)\.to\.not\.(eq|equal)\(/g, ').not.toBe(')
  s = s.replace(/\)\.to\.be\.greaterThan\(/g, ').toBeGreaterThan(')
  s = s.replace(/\)\.to\.be\.lessThan\(/g, ').toBeLessThan(')
  s = s.replace(/\)\.to\.be\.true\b/g, ').toBe(true)')
  s = s.replace(/\)\.to\.be\.false\b/g, ').toBe(false)')
  s = s.replace(/\)\.to\.be\.null\b/g, ').toBeNull()')
  s = s.replace(/\)\.to\.be\.undefined\b/g, ').toBeUndefined()')
  s = s.replace(/\)\.to\.have\.length\(/g, ').toHaveLength(')
  s = s.replace(/\)\.to\.have\.lengthOf\(/g, ').toHaveLength(')
  s = s.replace(/\)\.to\.include\(/g, ').toContain(')
  s = s.replace(/\)\.to\.contain\(/g, ').toContain(')
  s = s.replace(/\)\.to\.match\(/g, ').toMatch(')
  s = s.replace(/\)\.to\.not\.equal\(/g, ').not.toBe(')
  return s
}

function dedupeTestTitles(src) {
  // Playwright forbids two tests with the same title in the same file.
  // Cypress allows it. Append a (2), (3), … suffix to repeated names so the
  // tests still run side-by-side.
  const seen = new Map()
  return src.replace(/(\btest\(\s*)(['"`])([\s\S]*?)\2/g, (m, prefix, quote, title) => {
    const count = (seen.get(title) ?? 0) + 1
    seen.set(title, count)
    if (count === 1) {
      return m
    }
    const newTitle = `${title} (${count})`
    return `${prefix}${quote}${newTitle}${quote}`
  })
}

function cleanupOrphanThens(src) {
  // After translation, multi-stage chains like `cy.X().then(...).then(...)`
  // can leave orphan `.then(() => {…})` segments because the first .then was
  // unwrapped inline. Detect those orphans and inline their body so the
  // resulting code parses. The body is already translated into Playwright
  // form by the rest of the pipeline.
  const lines = src.split('\n')
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const m = line.match(/^(\s*)\.then\(\s*(async\s+)?\(\)\s*=>\s*\{\s*$/)
    if (!m) {
      out.push(line)
      i++
      continue
    }
    const indent = m[1]
    // Find the matching closing `})` line.
    let depth = 1
    let j = i + 1
    const bodyLines = []
    while (j < lines.length) {
      const l = lines[j]
      // Find `})` or `}` accounting for paren/brace depth in the line.
      depth += (l.match(/\{/g) || []).length
      depth -= (l.match(/\}/g) || []).length
      if (depth <= 0) {
        break
      }
      bodyLines.push(l)
      j++
    }
    // Emit body lines (with original indent, less the `.then` extra level)
    for (const bl of bodyLines) {
      out.push(bl)
    }
    i = j + 1
  }
  return out.join('\n')
}

function translateFile(inputPath, outputPath) {
  let source = fs.readFileSync(inputPath, 'utf8')
  // Strip any previously injected helper import (idempotent re-runs).
  source = source.replace(/^import \{[^}]*\} from '[^']*\/support\/index\.js'\s*\n+/gm, '')
  let translated = translate(source)
  translated = cleanupOrphanThens(translated)
  translated = dedupeTestTitles(translated)
  const banner = `${helperImport(outputPath)}\n\n`
  fs.writeFileSync(outputPath, banner + translated)
}

const args = process.argv.slice(2)
if (args[0] === '--file' && args[1]) {
  const inputPath = path.resolve(args[1])
  const outputPath = inputPath.replace(/\.spec\.js$/, '.spec.ts').replace(/\.cy\.(js|ts)$/, '.spec.ts')
  translateFile(inputPath, outputPath)
  console.log(`translated → ${outputPath}`)
} else {
  console.log('Usage: node scripts/cypress-to-playwright.mjs --file <path>')
  process.exit(1)
}
