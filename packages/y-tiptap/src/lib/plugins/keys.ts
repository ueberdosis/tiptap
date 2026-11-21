import type { SyncPluginState } from '../../types/SyncPluginState.js'
import type { UndoPluginState } from '../../types/UndoPluginState.js'
import { PluginKey } from 'prosemirror-state'
import type { DecorationSet } from 'prosemirror-view'
export const ySyncPluginKey = new PluginKey<SyncPluginState>('y-sync')
export const yUndoPluginKey = new PluginKey<UndoPluginState>('y-undo')
export const yCursorPluginKey = new PluginKey<DecorationSet>('yjs-cursor')
