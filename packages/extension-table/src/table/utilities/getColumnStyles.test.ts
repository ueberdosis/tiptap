import { describe, expect, it } from 'vite-plus/test'

import { getColumnStyles } from './getColumnStyles.js'

describe('getColumnStyles', () => {
  describe('without a relative width', () => {
    it('makes the table as wide as its columns when every column has a width', () => {
      expect(getColumnStyles([100, 200], 25, null)).toEqual({
        cols: [
          ['width', '100px'],
          ['width', '200px'],
        ],
        tableWidth: '300px',
        tableMinWidth: '',
      })
    })

    it('only sets a minimum width when a column has none', () => {
      expect(getColumnStyles([100, undefined], 25, null)).toEqual({
        cols: [
          ['width', '100px'],
          ['min-width', '25px'],
        ],
        tableWidth: '',
        tableMinWidth: '125px',
      })
    })
  })

  describe('with a relative width', () => {
    it('renders each column as its share of the stored widths', () => {
      expect(getColumnStyles([100, 300], 25, 100)).toEqual({
        cols: [
          ['width', '25%'],
          ['width', '75%'],
        ],
        tableWidth: '100%',
        tableMinWidth: '50px',
      })
    })

    it('splits a table without stored widths evenly', () => {
      expect(getColumnStyles([undefined, undefined, undefined], 25, 50).cols).toEqual([
        ['width', '33.3333%'],
        ['width', '33.3333%'],
        ['width', '33.3333%'],
      ])
    })

    it('counts a column without a stored width as the minimum cell width', () => {
      expect(getColumnStyles([75, undefined], 25, 100).cols).toEqual([
        ['width', '75%'],
        ['width', '25%'],
      ])
    })
  })
})
