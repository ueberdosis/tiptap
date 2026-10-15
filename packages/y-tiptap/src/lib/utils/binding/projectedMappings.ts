import type { Node } from 'prosemirror-model'
import type { ProsemirrorMapping } from '../../../types/ProsemirrorMapping.js'
import type { YType } from '../../../types/YType.js'

export const projectedMappings = new WeakMap<ProsemirrorMapping, WeakMap<YType, Node>>()
