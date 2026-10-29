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

/** Top-level children that a migration reads and rewrites. Other children are unchanged. */
export interface PositionRegion {
  /** Position of the first child in the region, equal in the source and target documents. */
  from: number
  start: number
  sourceEnd: number
  targetEnd: number
}

export interface PositionMigrationPlan {
  doc: Node
  /** The document the Yjs fragment matched before these transactions. */
  source: Node
  transactions: Transaction[]
  region: PositionRegion | null
  characters: PositionCharacter[]
  nodes: PositionNode[]
  emptyTexts: PositionNode[]
  /** Transfers for unchanged children outside the region, which are not visited. */
  retainedTransfers: PositionTransfer[]
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
