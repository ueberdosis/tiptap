import type { PositionTransfer } from '../../../../types/PositionMigration.js'
import { describe, expect, it } from 'vite-plus/test'
import { mergePositionTransfers } from './mergePositionTransfers.js'

const type = { client: 9, clock: 0 }

const move = (clock: number, target: number | null): PositionTransfer => ({
  source: { client: 1, clock, length: 1 },
  target: target === null ? null : { client: 2, clock: target, type },
})

const destinations = (transfers: PositionTransfer[]) => {
  const result = new Map<string, string>()

  transfers.forEach(({ source, target }) => {
    for (let offset = 0; offset < source.length; offset += 1) {
      result.set(
        `${source.client}:${source.clock + offset}:${source.boundary ?? ''}`,
        target ? `${target.client}:${target.clock + offset}:${target.boundary ?? ''}` : 'null',
      )
    }
  })

  return result
}

describe('mergePositionTransfers', () => {
  it('merges character transfers written out of order into one range', () => {
    const merged = mergePositionTransfers([move(12, 22), move(10, 20), move(11, 21)])

    expect(merged).toEqual([
      { source: { client: 1, clock: 10, length: 3 }, target: { client: 2, clock: 20, type } },
    ])
  })

  it('keeps boundary transfers separate and in their written order', () => {
    const end: PositionTransfer = {
      source: { client: 3, clock: 5, length: 1, boundary: 'end' },
      target: { client: 4, clock: 7, type: null, boundary: 'end' },
    }
    const start: PositionTransfer = {
      source: { client: 3, clock: 4, length: 1, boundary: 'start' },
      target: { client: 4, clock: 6, type: null, boundary: 'start' },
    }

    expect(mergePositionTransfers([end, move(1, 1), start])).toEqual([move(1, 1), end, start])
  })

  it('keeps the destination of every character', () => {
    const transfers = Array.from({ length: 300 }, (_, clock) => {
      if (clock >= 100 && clock < 150) return move(clock, null)
      return move(clock, clock < 200 ? 1000 + clock : 2000 + clock)
    })
    let seed = 7

    for (let index = transfers.length - 1; index > 0; index -= 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      const other = seed % (index + 1)
      ;[transfers[index], transfers[other]] = [transfers[other], transfers[index]]
    }

    const merged = mergePositionTransfers(transfers)

    expect(destinations(merged)).toEqual(destinations(transfers))
    expect(merged).toHaveLength(4)
  })
})
