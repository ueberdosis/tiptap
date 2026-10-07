import type { Editor } from '@tiptap/core'
import type { z } from 'zod'

/**
 * Represents a JSON schema awareness item for AI model understanding
 *
 * This interface defines the structure of schema information that is provided
 * to AI models to help them understand what JSON elements and attributes are
 * available in the editor's schema.
 */
export interface JsonItem {
  /**
   * The name of the extension that provides this element
   */
  extensionName: string
  /**
   * If `true`, the item is a mark instead of a node.
   */
  isMark?: boolean
  /**
   * The human-readable name of the element in English
   */
  name: string
  /**
   * Explanation of the element in English for the AI model
   */
  description?: string | null
  /**
   * Possible attributes of the JSON element. If `undefined`, there are no attributes.
   * The keys are attribute names and the values are Zod schemas that define the attribute structure.
   */
  attributes?: Record<string, z.ZodTypeAny>
}

export type SerializedJsonItem = Omit<JsonItem, 'attributes'> & { attributes?: unknown }

export type AddJsonSchemaAwareness<Options = any, Storage = any> = (this: {
  name: string
  options: Options
  storage: Storage
  editor?: Editor
}) => Omit<JsonItem, 'extensionName' | 'isMark'>

declare module '@tiptap/core' {
  interface NodeConfig<Options, Storage> {
    addJsonSchemaAwareness?: AddJsonSchemaAwareness<Options, Storage>
  }
  interface MarkConfig<Options, Storage> {
    addJsonSchemaAwareness?: AddJsonSchemaAwareness<Options, Storage>
  }
}
