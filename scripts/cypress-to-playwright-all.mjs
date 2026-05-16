#!/usr/bin/env node
/* eslint-disable */
import { execSync } from 'node:child_process'
import { globSync } from 'tinyglobby'

const patterns = ['demos/src/**/*.spec.js']
const files = patterns.flatMap(p => globSync(p, { ignore: ['**/node_modules/**'] }))

let ok = 0
let failed = 0
for (const file of files) {
  try {
    execSync(`node scripts/cypress-to-playwright.mjs --file "${file}"`, { stdio: 'pipe' })
    ok++
  } catch (e) {
    console.error(`FAIL: ${file}\n${e.stderr?.toString() ?? e.message}`)
    failed++
  }
}
console.log(`Translated ${ok} files; ${failed} failed`)
