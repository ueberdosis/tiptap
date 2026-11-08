import { getTableOfContentsDepths } from './getTableOfContentsDepths.js'
import type { FilterTableOfContentsOptions, TableOfContentsHeading } from './types.js'

/**
 * Keeps only the headings an outline should show.
 * @param headings The result of `resolveTableOfContents`.
 * @param options The levels to keep and the deepest depth to show.
 * @returns The kept headings with their depths counted again.
 * @example
 * filterTableOfContents(resolveTableOfContents(doc), { levels: [2, 3], maxDepth: 2 })
 */
export function filterTableOfContents(
  headings: TableOfContentsHeading[],
  options: FilterTableOfContentsOptions = {},
): TableOfContentsHeading[] {
  const { levels, maxDepth } = options
  const keptHeadings = levels
    ? headings.filter(heading => levels.includes(heading.level))
    : headings
  const depths = getTableOfContentsDepths(keptHeadings.map(heading => heading.level))

  return keptHeadings
    .map((heading, index) => ({ ...heading, depth: depths[index] }))
    .filter(heading => maxDepth === undefined || heading.depth <= maxDepth)
}
