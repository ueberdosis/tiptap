import { readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageSpecifiers = new Map([
  ['@tiptap/vue-3', '@tiptap/vue'],
  ['@tiptap/extension-drag-handle-vue-3', '@tiptap/extension-drag-handle-vue'],
])

const scriptPattern = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
const skippedDirectories = new Set(['.git', 'build', 'dist', 'node_modules'])

function skipTrivia(source, start) {
  let index = start

  while (index < source.length) {
    if (/\s/.test(source[index])) {
      index += 1
      continue
    }

    if (source.startsWith('//', index)) {
      const lineEnd = source.indexOf('\n', index + 2)
      index = lineEnd === -1 ? source.length : lineEnd + 1
      continue
    }

    if (source.startsWith('/*', index)) {
      const commentEnd = source.indexOf('*/', index + 2)
      index = commentEnd === -1 ? source.length : commentEnd + 2
      continue
    }

    break
  }

  return index
}

function readStringEnd(source, start) {
  const quote = source[start]

  for (let index = start + 1; index < source.length; index += 1) {
    if (source[index] === '\\') {
      index += 1
      continue
    }

    if (source[index] === quote) {
      return index
    }
  }

  return source.length
}

function readIdentifierEnd(source, start) {
  let index = start

  while (index < source.length && /[\w$]/.test(source[index])) {
    index += 1
  }

  return index
}

function isIdentifierStart(character) {
  return /[A-Za-z_$]/.test(character)
}

function getSpecifierEdit(source, start) {
  const quote = source[start]

  if (quote !== "'" && quote !== '"') {
    return null
  }

  const end = readStringEnd(source, start)
  const specifier = source.slice(start + 1, end)
  const replacement = packageSpecifiers.get(specifier)

  if (!replacement || end === source.length) {
    return null
  }

  return {
    end: end + 1,
    start,
    text: `${quote}${replacement}${quote}`,
  }
}

function findSpecifier(source, start, requiresCall) {
  let index = skipTrivia(source, start)

  if (requiresCall) {
    if (source[index] !== '(') {
      return null
    }

    index = skipTrivia(source, index + 1)
  }

  return getSpecifierEdit(source, index)
}

function findImportedSpecifier(source, start, limit = source.length) {
  const end = limit === -1 ? source.length : limit

  for (let index = start; index < end; index += 1) {
    if (source.startsWith('//', index)) {
      const lineEnd = source.indexOf('\n', index + 2)
      index = lineEnd === -1 ? source.length : lineEnd
      continue
    }

    if (source.startsWith('/*', index)) {
      const commentEnd = source.indexOf('*/', index + 2)
      index = commentEnd === -1 ? source.length : commentEnd + 1
      continue
    }

    if (source[index] === "'" || source[index] === '"' || source[index] === '`') {
      index = readStringEnd(source, index)
      continue
    }

    if (isIdentifierStart(source[index])) {
      const end = readIdentifierEnd(source, index)

      if (source.slice(index, end) === 'from') {
        return findSpecifier(source, end, false)
      }

      index = end - 1
    }
  }

  return null
}

function replacePackageSpecifiers(source) {
  const edits = []

  for (let index = 0; index < source.length;) {
    if (source.startsWith('//', index)) {
      const lineEnd = source.indexOf('\n', index + 2)
      index = lineEnd === -1 ? source.length : lineEnd + 1
      continue
    }

    if (source.startsWith('/*', index)) {
      const commentEnd = source.indexOf('*/', index + 2)
      index = commentEnd === -1 ? source.length : commentEnd + 2
      continue
    }

    if (source[index] === "'" || source[index] === '"' || source[index] === '`') {
      index = readStringEnd(source, index) + 1
      continue
    }

    if (!isIdentifierStart(source[index])) {
      index += 1
      continue
    }

    const end = readIdentifierEnd(source, index)
    const identifier = source.slice(index, end)
    const previous = source.slice(0, index).trimEnd().at(-1)

    if (previous === '.') {
      index = end
      continue
    }

    const edit =
      identifier === 'import'
        ? (findSpecifier(source, end, source[skipTrivia(source, end)] === '(') ??
          findImportedSpecifier(source, end))
        : identifier === 'export'
          ? findImportedSpecifier(source, end, source.indexOf('\n', end))
          : identifier === 'require'
            ? findSpecifier(source, end, true)
            : null

    if (edit) {
      edits.push(edit)
    }

    index = end
  }

  return edits.reduceRight(
    (result, edit) => `${result.slice(0, edit.start)}${edit.text}${result.slice(edit.end)}`,
    source,
  )
}

/** Rewrites known Tiptap package specifiers inside Vue script blocks. */
export function transformVueSource(source) {
  return source.replace(scriptPattern, (script, content) =>
    script.replace(content, replacePackageSpecifiers(content)),
  )
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
