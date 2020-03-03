context('Basic', () => {
  beforeEach(() => {
    cy.visit('/tests/basic')
  })

  describe('insertText', () => {
    it('should prepend text', () => {
      cy.get('.ProseMirror').should('contain', 'foo')

      cy.window().then(win => {
        win.editor.insertText('bar')
        cy.get('.ProseMirror').should('contain', 'barfoo')
      })
    })
  })
})