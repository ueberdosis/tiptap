import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Runs a script's main function, unless the script was only imported.
 *
 * @param {string} moduleUrl - `import.meta.url` of the script.
 * @param {() => void} main - Entry point of the script.
 */
export function runIfCalledDirectly(moduleUrl, main) {
  if (!process.argv[1] || resolve(process.argv[1]) !== fileURLToPath(moduleUrl)) return

  try {
    main()
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}
