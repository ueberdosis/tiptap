import type { Node } from 'prosemirror-model'
import type { Transaction } from 'prosemirror-state'
import type { ID } from 'yjs'

export interface PositionCharacter {
  client: number
  clock: number
  text: string
  type: ID
  position: number | null
}

export type PositionMigrationPlan =
  | PositionMigrationContent
  | {
      doc: Node
      transactions: Transaction[]
    }

export interface PositionMigrationContent {
  doc: Node
  characters: PositionCharacter[]
  nodes: PositionNode[]
  emptyTexts: PositionNode[]
}

export interface PositionNode {
  id: ID
  position: number | null
  end: number | null
}

export interface PositionTransfer {
  source: { client: number; clock: number; length: number; boundary?: 'start' | 'end' }
  target: {
    client: number
    clock: number
    type: ID | null
    tname?: string
    assoc?: number
    boundary?: 'start' | 'end'
  } | null
}

export interface PositionMigration {
  version: 1
  client: number
  clock: number
  seen: [number, number][]
  transfers: PositionTransfer[]
}

export interface PositionMigrationCandidate {
  migration: PositionMigration
  transfer: PositionTransfer
}

export interface PositionMigrationIndex {
  size: number
  clients: Map<number, PositionMigrationCandidate[]>
}
