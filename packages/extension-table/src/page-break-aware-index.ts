/**
 * Page Break Aware Table Extensions for TipTap
 *
 * This module provides table extensions that can handle content exceeding page height
 * by allowing natural page breaks within table cells, similar to Google Docs.
 *
 * @see https://github.com/ueberdosis/tiptap/issues/6813
 */

// Main extension bundle
export type { PageBreakAwareTableKitOptions } from './page-break-aware-table-kit.js'
export { PageBreakAwareTableKit } from './page-break-aware-table-kit.js'

// Individual extensions
export type { PageBreakAwareTableCellOptions } from './cell/page-break-aware-table-cell.js'
export { PageBreakAwareTableCell } from './cell/page-break-aware-table-cell.js'
export type { PageBreakAwareTableHeaderOptions } from './header/page-break-aware-table-header.js'
export { PageBreakAwareTableHeader } from './header/page-break-aware-table-header.js'
export type { PageBreakAwareTableOptions } from './table/page-break-aware-table.js'
export { PageBreakAwareTable } from './table/page-break-aware-table.js'

// NodeView
export { PageBreakAwareTableView } from './table/PageBreakAwareTableView.js'

// Test utilities
export { runPageBreakTableTests } from './test-page-break-tables.js'

// Examples and documentation
export * from './page-break-aware-table-example.js'
