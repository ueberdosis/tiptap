import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const packagesDirectory = resolve('packages')
const fields = ['main', 'module', 'types']
const errors = []

function collectTargets(value, targets = []) {
  if (typeof value === 'string') {
    targets.push(value)
    return targets
  }

  if (!value || typeof value !== 'object') return targets

  for (const nestedValue of Object.values(value)) collectTargets(nestedValue, targets)

  return targets
}

for (const packageDirectory of readdirSync(packagesDirectory, { withFileTypes: true })) {
  if (!packageDirectory.isDirectory()) continue

  const packageRoot = join(packagesDirectory, packageDirectory.name)
  const manifestPath = join(packageRoot, 'package.json')
  if (!existsSync(manifestPath)) continue

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const targets = fields.flatMap(field => (typeof manifest[field] === 'string' ? [manifest[field]] : []))
  targets.push(...collectTargets(manifest.exports))

  for (const target of new Set(targets)) {
    if (!target.startsWith('./dist/')) continue

    const targetPath = join(packageRoot, target.slice(2))
    if (!existsSync(targetPath)) errors.push(`${manifest.name}: ${target}`)
  }
}

if (errors.length > 0) {
  console.error('Missing package export targets:')
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log('All package export targets exist.')
}
