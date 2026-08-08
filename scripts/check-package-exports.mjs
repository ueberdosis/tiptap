import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve('.')
const fields = ['main', 'module', 'types']
const errors = []
let total = 0

function collectTargets(value, targets = []) {
  if (typeof value === 'string') {
    targets.push(value)
    return targets
  }

  if (!value || typeof value !== 'object') return targets

  for (const nestedValue of Object.values(value)) collectTargets(nestedValue, targets)

  return targets
}

for (const dir of ['packages', 'packages-deprecated']) {
  const base = join(root, dir)
  if (!existsSync(base)) continue

  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue

    const packageRoot = join(base, entry.name)
    const manifestPath = join(packageRoot, 'package.json')
    if (!existsSync(manifestPath)) continue

    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    total += 1

    const targets = fields.flatMap(field =>
      typeof manifest[field] === 'string' ? [manifest[field]] : [],
    )
    targets.push(...collectTargets(manifest.exports))

    for (const target of new Set(targets)) {
      if (!target.startsWith('./dist/')) continue

      const targetPath = join(packageRoot, target.slice(2))
      if (!existsSync(targetPath)) errors.push(`${manifest.name}: ${target}`)
    }
  }
}

if (errors.length > 0) {
  console.error(`Missing package export targets in ${total} packages:`)
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(`All package export targets exist in ${total} packages.`)
}
