context('/api/marks/link', () => {
  before(() => {
    cy.visit('/api/marks/link')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  it('should parse a tags correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p><a href="#">Example Text</a></p>')
      expect(editor.getHTML()).to.eq('<p><a href="#" target="_blank" rel="noopener noreferrer nofollow">Example Text</a></p>')
    })
  })

  it('should parse a tags with target attribute correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p><a href="#" target="_self">Example Text</a></p>')
      expect(editor.getHTML()).to.eq('<p><a href="#" target="_self" rel="noopener noreferrer nofollow">Example Text</a></p>')
    })
  })

  it('should parse a tags with rel attribute correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p><a href="#" rel="follow">Example Text</a></p>')
      expect(editor.getHTML()).to.eq('<p><a href="#" target="_blank" rel="noopener noreferrer nofollow">Example Text</a></p>')
    })
  })

  it('the button should add a link to the selected text', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('https://tiptap.dev')

      cy.get('.demo__preview button:first')
        .click()

      cy.window().its('prompt').should('be.called')

      cy.get('.ProseMirror')
        .find('a')
        .should('contain', 'Example Text')
        .should('have.attr', 'href', 'https://tiptap.dev')
    })
  })

  const validUrls = [
    'https://example.com',
    'https://example.com/with-path',
    'http://example.com/with-http',
    'https://www.example.com/with-www',
    'https://www.example.com/with-numbers-123',
    'https://www.example.com/with-parameters?var=true',
    'https://www.example.com/with-multiple-parameters?var=true&foo=bar',
    'https://www.example.com/with-spaces?var=true&foo=bar+3',
    // TODO: 'https://www.example.com/with,comma',
    // TODO: 'https://www.example.com/with(brackets)',
    // TODO: 'https://www.example.com/with!exclamation!marks',
    'http://thelongestdomainnameintheworldandthensomeandthensomemoreandmore.com/',
    'https://example.longtopleveldomain',
    'https://example-with-dashes.com',
  ]

  validUrls.forEach(url => {
    it(`url should be detected: ${url}`, () => {
      cy.get('.ProseMirror').paste({ pastePayload: url, pasteType: 'text/plain' })
        .find('a')
        .should('contain', url)
        .should('have.attr', 'href', url)
    })
  })
})
