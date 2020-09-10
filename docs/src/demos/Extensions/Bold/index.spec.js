context('/api/extensions/bold', () => {
  beforeEach(() => {
    cy.visit('/api/extensions/bold')

    cy.get('.ProseMirror').window().then(window => {
      const { editor } = window
      editor.setContent('<p>Example Text</p>')
      editor.focus().selectAll()
    })
  })

  describe('bold', () => {
    it('the button should make the selected text bold', () => {
      cy.get('.demo__preview button:first').click({ force: true })
      cy.get('.ProseMirror').contains('strong', 'Example Text')
    })

    it('the button should toggle the selected text bold', () => {
      cy.get('.demo__preview button:first').dblclick({ force: true })
      cy.get('.ProseMirror strong').should('not.exist')
    })

    it('the keyboard shortcut should make the selected text bold', () => {
      cy.get('.ProseMirror').type('{meta}b', {force: true})
      cy.get('.ProseMirror').contains('strong', 'Example Text')
    })

    it('the keyboard shortcut should toggle the selected text bold', () => {
      cy.get('.ProseMirror').type('{meta}b', {force: true}).type('{meta}b', {force: true})
      cy.get('.ProseMirror strong').should('not.exist')
    })

    it('should make a bold text from the default markdown shortcut', () => {
      cy.get('.ProseMirror')
        .type('**Bold**', {force: true})
        .contains('strong', 'Bold')
    })

    it('should make a bold text from the alternative markdown shortcut', () => {
      cy.get('.ProseMirror')
        .type('__Bold__', {force: true})
        .contains('strong', 'Bold')
    })
  })
})