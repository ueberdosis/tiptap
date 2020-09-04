import Mark from '../Mark'
import collect from 'collect.js'
import { Extensions } from '../types'

export default function getMarksFromExtensions(extensions: Extensions): any {
  return collect(extensions)
    .where('extensionType', 'mark')
    .mapWithKeys((extension: Mark) => [extension.name, extension.schema()])
    .all()
}