context('/src/Examples/AutolinkValidation/React/', () => {
  before(() => {
    cy.visit('/src/Examples/AutolinkValidation/React/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').type('{selectall}{backspace}')
  })

  const validLinks = [
    'https://tiptap.dev',
    'http://tiptap.dev',
    'https://www.tiptap.dev/',
    'http://www.tiptap.dev/',
  ]

  const invalidLinks = [
    'tiptap.dev',
    'www.tiptap.dev',
  ]

  validLinks.forEach(link => {
    it(`${link} should get autolinked`, () => {
      cy.get('.ProseMirror').type(link)
      cy.get('.ProseMirror').should('have.text', link)
      cy.get('.ProseMirror')
        .find('a')
        .should('have.length', 1)
        .should('have.attr', 'href', link)
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
