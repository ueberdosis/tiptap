context('/api/extensions/bold', () => {
  beforeEach(() => {
    cy.visit('/api/extensions/bold')

    cy.get('.ProseMirror').window().then(window => {
      const { editor } = window
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  it('the button should make the selected text bold', () => {
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror').contains('strong', 'Example Text')
  })

  it('the button should toggle the selected text bold', () => {
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror').type('{selectall}', { force: true })
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror strong').should('not.exist')
  })

  it('the keyboard shortcut should make the selected text bold', () => {
    cy.get('.ProseMirror')
      .type('{meta}b', { force: true })
      .contains('strong', 'Example Text')
  })

  it('the keyboard shortcut should toggle the selected text bold', () => {
    cy.get('.ProseMirror')
      .type('{meta}b', { force: true })
      .contains('strong', 'Example Text')

    cy.get('.ProseMirror')
      .type('{selectall}', { force: true })
      .type('{meta}b', { force: true })
      .should('not.exist')
  })

  it('should make a bold text from the default markdown shortcut', () => {
    cy.get('.ProseMirror')
      .type('**Bold**', { force: true })
      .contains('strong', 'Bold')
  })

  it('should make a bold text from the alternative markdown shortcut', () => {
    cy.get('.ProseMirror')
      .type('__Bold__', { force: true })
      .contains('strong', 'Bold')
  })
})