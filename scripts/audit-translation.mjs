#!/usr/bin/env node
/* eslint-disable */
/**
 * Audit each translated Playwright spec against its original Cypress
 * counterpart. For every pair we extract:
 *   - test (it/context) titles
 *   - assertion counts (cy.* commands and .should/expect calls)
 *   - explicit "lost coverage" markers (TODO comments, test.fixme)
 *
 * The report flags pairs where the assertion count dropped, tests were
 * dropped or renamed, TODOs are present, or fixme markers exist.
 *
 * Usage: node scripts/audit-translation.mjs [--verbose]
 */
import fs from 'node:fs'
import path from 'node:path'
import { globSync } from 'tinyglobby'

const ORIGINALS_ROOT = '/tmp/cypress-originals'
const VERBOSE = process.argv.includes('--verbose')

const pairs = []
for (const rel of globSync('demos/src/**/*.spec.js', { cwd: ORIGINALS_ROOT })) {
  const original = path.join(ORIGINALS_ROOT, rel)
  const translated = rel.replace(/\.spec\.js$/, '.spec.ts')
  pairs.push({ original, translated, rel })
}
// Integration specs moved tests/cypress/integration/core → tests/e2e/core
for (const rel of globSync('tests/cypress/integration/**/*.spec.ts', { cwd: ORIGINALS_ROOT })) {
  const original = path.join(ORIGINALS_ROOT, rel)
  const translated = rel.replace(/^tests\/cypress\/integration\//, 'tests/e2e/')
  pairs.push({ original, translated, rel })
}

function extractItTitles(src) {
  const re = /\b(?:it|test)\(\s*(['"`])((?:[^\\]|\\.)*?)\1/g
  const out = []
  let m
  while ((m = re.exec(src)) !== null) {
    out.push(m[2])
  }
  return out
}

function countMatches(src, re) {
  return (src.match(re) || []).length
}

function analyzeOriginal(src) {
  return {
    titles: extractItTitles(src),
    cyCalls: countMatches(src, /\bcy\.[a-zA-Z]+\(/g),
    shoulds: countMatches(src, /\.should\(/g),
    expects: countMatches(src, /\bexpect\(/g),
    stubs: countMatches(src, /\bcy\.stub\(/g),
    intercepts: countMatches(src, /\bcy\.intercept\(/g),
    paste: countMatches(src, /\.paste\(/g),
    trigger: countMatches(src, /\.trigger\(/g),
    invoke: countMatches(src, /\.invoke\(/g),
    its: countMatches(src, /\.its\(/g),
    then: countMatches(src, /\.then\(/g),
    asserts: countMatches(src, /\.should\(|\bexpect\(/g),
  }
}

function analyzeTranslated(src) {
  return {
    titles: extractItTitles(src),
    expects: countMatches(src, /\bexpect\(/g),
    helpers: {
      setEditorContent: countMatches(src, /setEditorContent\(/g),
      getEditorHTML: countMatches(src, /getEditorHTML\(/g),
      getEditorJSON: countMatches(src, /getEditorJSON\(/g),
      getEditorText: countMatches(src, /getEditorText\(/g),
      editorEval: countMatches(src, /editorEval\(/g),
      pasteIntoEditor: countMatches(src, /pasteIntoEditor\(/g),
      pressShortcut: countMatches(src, /pressShortcut\(/g),
      typeText: countMatches(src, /typeText\(/g),
    },
    todos: countMatches(src, /TODO\(playwright-migration\)/g),
    fixme: countMatches(src, /test\.fixme\(/g),
    skip: countMatches(src, /test\.skip\(/g),
    commentedThens: countMatches(src, /\/\/ TODO\(playwright-migration\): \.then\(\)/g),
    commentedShoulds: countMatches(src, /\/\/ TODO\(playwright-migration\): unhandled should/g),
    commentedInvokes: countMatches(src, /\/\/ TODO\(playwright-migration\): unhandled \.invoke/g),
    commentedIts: countMatches(src, /\/\/ TODO\(playwright-migration\): unhandled \.its/g),
    commentedStubs: countMatches(src, /\/\/ TODO\(playwright-migration\): cy\.stub/g),
    commentedWindow: countMatches(src, /\/\/ TODO\(playwright-migration\): cy\.window/g),
    commentedTriggers: countMatches(src, /\/\/ TODO\(playwright-migration\): trigger/g),
    commentedTranslateThen: countMatches(src, /\/\/ TODO\(playwright-migration\): translate cy\.\w+/g),
  }
}

const findings = []
let aggregateLost = 0
let aggregateTodos = 0

for (const { original, translated, rel } of pairs) {
  if (!fs.existsSync(translated)) {
    findings.push({ rel, severity: 'MISSING', detail: `translated file not found: ${translated}` })
    continue
  }
  const origSrc = fs.readFileSync(original, 'utf8')
  const transSrc = fs.readFileSync(translated, 'utf8')
  const o = analyzeOriginal(origSrc)
  const t = analyzeTranslated(transSrc)

  const lostTitles = o.titles.filter(tt => !t.titles.includes(tt) && !t.titles.some(x => x.startsWith(tt + ' ')))
  if (lostTitles.length > 0) {
    findings.push({ rel, severity: 'DROPPED_TEST', detail: lostTitles })
  }

  if (t.fixme > 0) {
    findings.push({ rel, severity: 'FIXME', detail: `${t.fixme} test.fixme()` })
  }
  if (t.todos > 0) {
    aggregateTodos += t.todos
    findings.push({ rel, severity: 'TODO', detail: `${t.todos} TODO markers (then:${t.commentedThens}, should:${t.commentedShoulds}, invoke:${t.commentedInvokes}, its:${t.commentedIts}, stub:${t.commentedStubs}, win:${t.commentedWindow}, trig:${t.commentedTriggers}, transl:${t.commentedTranslateThen})` })
  }

  // Coverage drop: original had assertions/cy calls that aren't reflected
  // in the translated file (counting helper calls + expects).
  const originalAssertions = o.asserts
  const translatedAssertions = t.expects
  // Some originals use bare `editor.X` checks that turned into helpers.
  // To avoid false positives we only flag when the gap is large.
  const gap = originalAssertions - translatedAssertions
  if (gap >= 5) {
    aggregateLost += gap
    findings.push({ rel, severity: 'COVERAGE_GAP', detail: `assertions: orig=${originalAssertions} → trans=${translatedAssertions} (gap ${gap})` })
  }

  if (o.stubs > 0 && t.helpers.editorEval + t.expects < o.stubs) {
    findings.push({ rel, severity: 'STUB_LOST', detail: `${o.stubs} cy.stub call(s) in original` })
  }
}

if (VERBOSE) {
  for (const f of findings) {
    console.log(`[${f.severity}] ${f.rel}: ${typeof f.detail === 'string' ? f.detail : JSON.stringify(f.detail)}`)
  }
} else {
  const by = new Map()
  for (const f of findings) {
    if (!by.has(f.severity)) {
      by.set(f.severity, 0)
    }
    by.set(f.severity, by.get(f.severity) + 1)
  }
  for (const [k, v] of by) {
    console.log(`${k}: ${v} file(s)`)
  }
  console.log(`total TODO markers: ${aggregateTodos}`)
  console.log(`total assertion gap (sum): ${aggregateLost}`)
  console.log(`(use --verbose for per-file detail)`)
}
