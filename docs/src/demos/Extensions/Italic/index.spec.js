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
    })

    it('should toggle the selected text italic', () => {
      cy.get('.demo__preview button:first').dblclick({ force: true })
      cy.get('.ProseMirror em').should('not.exist')
    })

    it('the keyboard shortcut should make the selected text italic', () => {
      const shortcut = Cypress.platform === 'darwin' ? '{meta}i' : '{ctrl}i'

      cy.get('.ProseMirror').type(shortcut, {force: true})
      cy.get('.ProseMirror').contains('em', 'Example Text')
    })

    it('the button should toggle the selected text italic', () => {
      const shortcut = Cypress.platform === 'darwin' ? '{meta}i' : '{ctrl}i'

      cy.get('.ProseMirror').type(shortcut, {force: true}).type(shortcut, {force: true})
      cy.get('.ProseMirror em').should('not.exist')
    })
  })
})