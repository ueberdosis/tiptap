import { it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const publishScript = fileURLToPath(new URL('../publish.sh', import.meta.url))
const commands = [
  'run build',
  'run build:demos',
  'check-package-dists',
  'run check:package-exports',
  'exec changeset publish',
]

function runPublish(failingCommand = '') {
  const directory = mkdtempSync(join(tmpdir(), 'tiptap-publish-'))
  const logPath = join(directory, 'commands.log')

  try {
    mkdirSync(join(directory, 'scripts'))
    const recordCommand = `
echo "$*" >> "$COMMAND_LOG"
if [ "$*" = "$FAILING_COMMAND" ]; then exit 1; fi
`
    writeFileSync(join(directory, 'vp'), `#!/usr/bin/env bash\n${recordCommand}`, {
      mode: 0o755,
    })
    writeFileSync(
      join(directory, 'scripts/check-package-dists.sh'),
      `set -- check-package-dists\n${recordCommand}`,
    )

    const result = spawnSync('bash', [publishScript], {
      cwd: directory,
      env: {
        ...process.env,
        PATH: `${directory}:${process.env.PATH}`,
        COMMAND_LOG: logPath,
        FAILING_COMMAND: failingCommand,
      },
      encoding: 'utf8',
    })

    assert.ifError(result.error)
    return {
      status: result.status,
      commands: readFileSync(logPath, 'utf8').trim().split('\n'),
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

it('builds and verifies artifacts before publishing', () => {
  const result = runPublish()
  assert.equal(result.status, 0)
  assert.deepEqual(result.commands, commands)
})

for (const [index, command] of commands.entries()) {
  it(`stops the release when ${command} fails`, () => {
    const result = runPublish(command)
    assert.equal(result.status, 1)
    assert.deepEqual(result.commands, commands.slice(0, index + 1))
  })
}
