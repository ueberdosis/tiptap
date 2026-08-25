import { readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageSpecifiers = new Map([
  ['@tiptap/vue-3', '@tiptap/vue'],
  ['@tiptap/extension-drag-handle-vue-3', '@tiptap/extension-drag-handle-vue'],
])

const scriptPattern = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
const importPattern = /\b(from\s*|import\s*(?:\(\s*)?|require\s*\(\s*)(['"])(@tiptap\/(?:vue-3|extension-drag-handle-vue-3))\2/g
const skippedDirectories = new Set(['.git', 'build', 'dist', 'node_modules'])

/** Rewrites known Tiptap package specifiers inside Vue script blocks. */
export function transformVueSource(source) {
  return source.replace(scriptPattern, (script, content) => {
    const transformedContent = content.replace(importPattern, (match, prefix, quote, specifier) => {
      const replacement = packageSpecifiers.get(specifier)

      return replacement ? `${prefix}${quote}${replacement}${quote}` : match
    })

    return script.replace(content, transformedContent)
  })
}

async function findVueFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!skippedDirectories.has(entry.name)) {
        files.push(...(await findVueFiles(resolve(directory, entry.name))))
      }

      continue
    }

    if (entry.isFile() && entry.name.endsWith('.vue')) {
      files.push(resolve(directory, entry.name))
    }
  }

  return files
}

async function migrateVueFiles(directory) {
  const files = await findVueFiles(directory)

  for (const file of files) {
    const source = await readFile(file, 'utf8')
    const transformedSource = transformVueSource(source)

    if (transformedSource !== source) {
      await writeFile(file, transformedSource)
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await migrateVueFiles(resolve(process.argv[2] ?? process.cwd()))
}
