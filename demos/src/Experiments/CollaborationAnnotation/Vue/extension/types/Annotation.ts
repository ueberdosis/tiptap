import type { Doc, Map as YMap } from 'yjs'

export type Annotation = {
  text: string
} & (
  | { kind: 'text'; from: number[]; to: number[] }
  | { kind: 'node'; anchor: number[]; nodeType: string }
)

export type AnnotationRange = { from: number; to: number } | { from: null; to: null }

export type ResolvedAnnotation = {
  id: string
  text: string
  kind: Annotation['kind']
} & AnnotationRange

export interface AnnotationOptions {
  map: YMap<Annotation> | null
  onUpdate: (annotations: ResolvedAnnotation[]) => void
}

export interface AnnotationPluginOptions {
  document: Doc
  map: YMap<Annotation>
  onUpdate: AnnotationOptions['onUpdate']
}
