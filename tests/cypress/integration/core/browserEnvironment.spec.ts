/// <reference types="cypress" />

// eslint-disable-next-line max-classes-per-file
import { BrowserEnvironment } from '@tiptap/core'

describe('BrowserEnvironment', () => {
  describe('constructor', () => {
    it('should create instance with empty options', () => {
      const browserEnv = new BrowserEnvironment()
      expect(browserEnv).to.be.instanceOf(BrowserEnvironment)
    })

    it('should create instance with custom options', () => {
      const mockWindow = {} as Window
      const mockDOMParser = class {} as typeof DOMParser

      const browserEnv = new BrowserEnvironment({
        window: mockWindow,
        domParser: mockDOMParser,
      })

      expect(browserEnv).to.be.instanceOf(BrowserEnvironment)
    })
  })

  describe('window property', () => {
    it('should return custom window when provided', () => {
      const mockWindow = { custom: true } as unknown as Window
      const browserEnv = new BrowserEnvironment({ window: mockWindow })

      expect(browserEnv.window).to.equal(mockWindow)
    })

    it('should fallback to global window in browser environment', () => {
      const browserEnv = new BrowserEnvironment()

      // In Cypress, window should be available
      expect(browserEnv.window).to.equal(window)
    })
  })

  describe('document property', () => {
    it('should return document from custom window when provided', () => {
      const mockDocument = { custom: true } as unknown as Document
      const mockWindow = { document: mockDocument } as unknown as Window
      const browserEnv = new BrowserEnvironment({ window: mockWindow })

      expect(browserEnv.document).to.equal(mockDocument)
    })

    it('should fallback to global document in browser environment', () => {
      const browserEnv = new BrowserEnvironment()

      // In Cypress, document should be available
      expect(browserEnv.document).to.equal(document)
    })
  })

  describe('navigator property', () => {
    it('should return navigator from custom window when provided', () => {
      const mockNavigator = { custom: true } as unknown as Navigator
      const mockWindow = { navigator: mockNavigator } as unknown as Window
      const browserEnv = new BrowserEnvironment({ window: mockWindow })

      expect(browserEnv.navigator).to.equal(mockNavigator)
    })

    it('should fallback to global navigator in browser environment', () => {
      const browserEnv = new BrowserEnvironment()

      // In Cypress, navigator should be available
      expect(browserEnv.navigator).to.equal(navigator)
    })
  })

  describe('DOMParser property', () => {
    it('should return custom DOMParser when provided', () => {
      const mockDOMParser = class MockDOMParser {} as typeof DOMParser
      const browserEnv = new BrowserEnvironment({ domParser: mockDOMParser })

      expect(browserEnv.DOMParser).to.equal(mockDOMParser)
    })

    it('should fallback to global DOMParser in browser environment', () => {
      const browserEnv = new BrowserEnvironment()

      // In Cypress, DOMParser should be available
      expect(browserEnv.DOMParser).to.equal(window.DOMParser)
    })
  })

  it('should work with custom implementations in server-like environment', () => {
    const mockDocument = { createElement: cy.stub() } as unknown as Document
    const mockNavigator = { userAgent: 'test-agent' } as unknown as Navigator
    const mockWindow = {
      document: mockDocument,
      navigator: mockNavigator,
      DOMParser: class MockDOMParser {},
    } as unknown as Window
    const mockDOMParser = class CustomDOMParser {} as typeof DOMParser

    const browserEnv = new BrowserEnvironment({
      window: mockWindow,
      domParser: mockDOMParser,
    })

    expect(browserEnv.window).to.equal(mockWindow)
    expect(browserEnv.document).to.equal(mockDocument)
    expect(browserEnv.navigator).to.equal(mockNavigator)
    expect(browserEnv.DOMParser).to.equal(mockDOMParser)
  })

  describe('integration with utility functions', () => {
    it('should work with platform detection utilities', () => {
      // Test with mock navigator for macOS detection
      const mockNavigator = { platform: 'MacIntel' } as unknown as Navigator
      const mockWindow = { navigator: mockNavigator } as unknown as Window
      const browserEnv = new BrowserEnvironment({ window: mockWindow })

      expect(browserEnv.navigator?.platform).to.equal('MacIntel')
    })

    it('should work with DOM manipulation utilities', () => {
      const mockDocument = {
        createElement: cy.stub().returns({ tagName: 'DIV' }),
        querySelector: cy.stub(),
      } as unknown as Document
      const mockWindow = { document: mockDocument } as unknown as Window
      const browserEnv = new BrowserEnvironment({ window: mockWindow })

      expect(browserEnv.document?.createElement).to.be.a('function')
      expect(browserEnv.document?.querySelector).to.be.a('function')
    })
  })
})
