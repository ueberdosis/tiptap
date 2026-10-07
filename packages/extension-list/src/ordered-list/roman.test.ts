import { describe, expect, it } from 'vite-plus/test'

import {
  areOrderedListMarkersSequential,
  detectMarkerType,
  getListMarker,
  markerToStart,
} from './roman.js'

describe('ordered list markers', () => {
  describe('getListMarker', () => {
    it('returns numeric markers for default type', () => {
      expect(getListMarker(null, 0, '. ')).toBe('1. ')
      expect(getListMarker(undefined, 4, '. ')).toBe('5. ')
      expect(getListMarker('1', 0, '. ')).toBe('1. ')
    })

    it('returns lowercase alpha markers for type "a"', () => {
      expect(getListMarker('a', 0, '. ')).toBe('a. ')
      expect(getListMarker('a', 1, '. ')).toBe('b. ')
      expect(getListMarker('a', 25, '. ')).toBe('z. ')
    })

    it('returns uppercase alpha markers for type "A"', () => {
      expect(getListMarker('A', 0, '. ')).toBe('A. ')
      expect(getListMarker('A', 1, '. ')).toBe('B. ')
      expect(getListMarker('A', 25, '. ')).toBe('Z. ')
    })

    it('returns lowercase roman markers for type "i"', () => {
      expect(getListMarker('i', 0, '. ')).toBe('i. ')
      expect(getListMarker('i', 1, '. ')).toBe('ii. ')
      expect(getListMarker('i', 3, '. ')).toBe('iv. ')
      expect(getListMarker('i', 9, '. ')).toBe('x. ')
    })

    it('returns uppercase roman markers for type "I"', () => {
      expect(getListMarker('I', 0, '. ')).toBe('I. ')
      expect(getListMarker('I', 1, '. ')).toBe('II. ')
      expect(getListMarker('I', 3, '. ')).toBe('IV. ')
      expect(getListMarker('I', 9, '. ')).toBe('X. ')
    })
  })

  describe('detectMarkerType', () => {
    it('detects default type for numeric markers', () => {
      expect(detectMarkerType('1')).toBeUndefined()
      expect(detectMarkerType('42')).toBeUndefined()
    })

    it('detects lowercase alpha', () => {
      expect(detectMarkerType('a')).toBe('a')
      expect(detectMarkerType('b')).toBe('a')
      expect(detectMarkerType('z')).toBe('a')
      expect(detectMarkerType('A')).toBe('A')
      expect(detectMarkerType('B')).toBe('A')
    })

    it('does not treat invalid roman strings as roman', () => {
      expect(detectMarkerType('aa')).toBe('a')
    })

    it('does not treat alpha markers longer than 2 letters as alpha', () => {
      expect(detectMarkerType('abc')).toBeUndefined()
      expect(detectMarkerType('ABC')).toBeUndefined()
    })

    it('detects lowercase roman', () => {
      expect(detectMarkerType('i')).toBe('i')
      expect(detectMarkerType('ii')).toBe('i')
      expect(detectMarkerType('iii')).toBe('i')
      expect(detectMarkerType('iv')).toBe('i')
      expect(detectMarkerType('v')).toBe('i')
    })

    it('detects uppercase roman', () => {
      expect(detectMarkerType('I')).toBe('I')
      expect(detectMarkerType('VI')).toBe('I')
      expect(detectMarkerType('X')).toBe('I')
    })
  })

  describe('areOrderedListMarkersSequential', () => {
    it('accepts sequential markers of the same style', () => {
      expect(areOrderedListMarkersSequential(['a', 'b', 'c'])).toBe(true)
      expect(areOrderedListMarkersSequential(['1', '2', '3'])).toBe(true)
      expect(areOrderedListMarkersSequential(['ii', 'iii', 'iv'])).toBe(true)
      expect(areOrderedListMarkersSequential(['b', 'c'])).toBe(true)
    })

    it('rejects mixed styles', () => {
      expect(areOrderedListMarkersSequential(['a', '1'])).toBe(false)
      expect(areOrderedListMarkersSequential(['i', 'ii', 'a'])).toBe(false)
    })

    it('rejects non-sequential markers', () => {
      expect(areOrderedListMarkersSequential(['a', 'c'])).toBe(false)
      expect(areOrderedListMarkersSequential(['1', '3'])).toBe(false)
      expect(areOrderedListMarkersSequential(['II', 'IV'])).toBe(false)
    })
  })

  describe('markerToStart', () => {
    it('parses numeric markers', () => {
      expect(markerToStart('3')).toBe(3)
      expect(markerToStart('42')).toBe(42)
    })

    it('parses alpha markers', () => {
      expect(markerToStart('a')).toBe(1)
      expect(markerToStart('b')).toBe(2)
      expect(markerToStart('aa')).toBe(27)
    })

    it('parses roman markers', () => {
      expect(markerToStart('i')).toBe(1)
      expect(markerToStart('ii')).toBe(2)
      expect(markerToStart('II')).toBe(2)
      expect(markerToStart('IV')).toBe(4)
    })
  })
})
