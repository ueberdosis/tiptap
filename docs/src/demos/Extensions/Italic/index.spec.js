context('/api/extensions/italic', () => {
  beforeEach(() => {
    cy.visit('/api/extensions/italic')

    cy.get('.ProseMirror').window().then(window => {
      const { editor } = window
      editor.setContent('<p>Example Text</p>')
      editor.focus().selectAll()
    })
  })

  describe('italic', () => {
    it('should make the selected text italic', () => {
      cy.get('.demo__preview button:first').click({ force: true })
      cy.get('.ProseMirror').contains('em', 'Example Text')

      cy.get('.demo__preview button:first').click({ force: true })
      cy.get('.ProseMirror em').should('not.exist')
    })

    it('should toggle the selected text italic', () => {
      cy.get('.demo__preview button:first').dblclick({ force: true })
      cy.get('.ProseMirror em').should('not.exist')
    })
  })
})