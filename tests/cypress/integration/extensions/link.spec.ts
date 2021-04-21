/// <reference types="cypress" />

import { pasteRegex } from '@tiptap/extension-link'

describe('link paste rules', () => {
  const validUrls = [
    'https://example.com',
    'https://example.com/with-path',
    'http://example.com/with-http',
    'https://www.example.com/with-www',
    'https://www.example.com/with-numbers-123',
    'https://www.example.com/with-parameters?var=true',
    'https://www.example.com/with-multiple-parameters?var=true&foo=bar',
    'https://www.example.com/with-spaces?var=true&foo=bar+3',
    'https://www.example.com/with,comma',
    'https://www.example.com/with(brackets)',
    'https://www.example.com/with!exclamation!marks',
    'http://thelongestdomainnameintheworldandthensomeandthensomemoreandmore.com/',
    'https://example.longtopleveldomain',
    'https://example-with-dashes.com',
  ]

  validUrls.forEach(url => {
    it(`paste regex matches url: ${url}`, {
      // every second test fails, but the second try succeeds
      retries: {
        runMode: 2,
        openMode: 2,
      },
    }, () => {
      // TODO: Check the regex capture group to see *what* is matched
      expect(url).to.match(pasteRegex)
    })
  })

  const invalidUrls = [
    'ftp://www.example.com',
  ]

  invalidUrls.forEach(url => {
    it(`paste regex doesn’t match url: ${url}`, {
      // every second test fails, but the second try succeeds
      retries: {
        runMode: 2,
        openMode: 2,
      },
    }, () => {
      expect(url).to.not.match(pasteRegex)
    })
  })
})
