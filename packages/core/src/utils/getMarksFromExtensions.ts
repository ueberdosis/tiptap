import Mark from '../Mark'
import collect from 'collect.js'
import { Extensions } from '../types'

export default function getMarksFromExtensions(extensions: Extensions): any {
  return collect(extensions)
    .where('type', 'mark')
    .mapWithKeys((extension: Mark) => [extension.config.name, extension.config.schema])
    .all()
}