context('/src/Examples/AutolinkValidation/Vue/', () => {
  before(() => {
    cy.visit('/src/Examples/AutolinkValidation/Vue/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').type('{selectall}{backspace}')
  })

  const validLinks = [
    // [rawTextInput, textThatShouldBeLinked]
    ['https://tiptap.dev ', 'https://tiptap.dev'],
    ['http://tiptap.dev ', 'http://tiptap.dev'],
    ['https://www.tiptap.dev/ ', 'https://www.tiptap.dev/'],
    ['http://www.tiptap.dev/ ', 'http://www.tiptap.dev/'],
    ['[http://www.example.com/] ', 'http://www.example.com/'],
    ['(http://www.example.com/) ', 'http://www.example.com/'],
  ]

  const invalidLinks = [
    'tiptap.dev',
    'www.tiptap.dev',
    // If you don't type a space, don't autolink
    'https://tiptap.dev',
  ]

  validLinks.forEach(link => {
    it(`${link[0]} should get autolinked`, () => {
      cy.get('.ProseMirror').type(link[0])
      cy.get('.ProseMirror').should('have.text', link[0])
      cy.get('.ProseMirror')
        .find('a')
        .should('have.length', 1)
        .should('have.attr', 'href', link[1])
    })
  })

  invalidLinks.forEach(link => {
    it(`${link} should NOT get autolinked`, () => {
      cy.get('.ProseMirror').type(link)
      cy.get('.ProseMirror').should('have.text', link)
      cy.get('.ProseMirror')
        .find('a')
        .should('have.length', 0)
    })
  })
})
