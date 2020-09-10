context('/api/extensions/underline', () => {
  beforeEach(() => {
    cy.visit('/api/extensions/underline')

    cy.get('.ProseMirror').window().then(window => {
      const { editor } = window
      editor.setContent('<p>Example Text</p>')
      editor.focus().selectAll()
    })
  })

  describe('bold', () => {
    it('the button should underline the selected text', () => {
      cy.get('.demo__preview button:first').click({ force: true })
      cy.get('.ProseMirror').contains('u', 'Example Text')
    })

    it('the button should toggle the selected text underline', () => {
      cy.get('.demo__preview button:first').dblclick({ force: true })
      cy.get('.ProseMirror u').should('not.exist')
    })

    it('the keyboard shortcut should underline the selected text', () => {
      cy.get('.ProseMirror').type('{meta}u', {force: true})
      cy.get('.ProseMirror').contains('u', 'Example Text')
    })

    it('the keyboard shortcut should toggle the selected text underline', () => {
      cy.get('.ProseMirror').type('{meta}u', {force: true}).type('{meta}u', {force: true})
      cy.get('.ProseMirror u').should('not.exist')
    })
  })
})