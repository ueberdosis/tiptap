context('/api/extensions/code-block', () => {
  beforeEach(() => {
    cy.visit('/api/extensions/code-block')

    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  it('the button should make the selected line a code block', () => {
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror').contains('pre', 'Example Text')
  })

  it('the button should toggle the code block', () => {
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror').contains('pre', 'Example Text')

    cy.get('.ProseMirror').type('{selectall}', { force: true })
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror pre').should('not.exist')
  })

  it('the keyboard shortcut should make the selected line a code block', () => {
    cy.get('.ProseMirror').type('{control}{shift}\\', { force: true })
    cy.get('.ProseMirror').contains('pre', 'Example Text')
  })

  it('the keyboard shortcut should toggle the code block', () => {
    cy.get('.ProseMirror').type('{control}{shift}\\', { force: true })
    cy.get('.ProseMirror').contains('pre', 'Example Text')

    cy.get('.ProseMirror').type('{selectall}', { force: true })
    cy.get('.ProseMirror').type('{control}{shift}\\', { force: true })
    cy.get('.ProseMirror pre').should('not.exist')
  })

  it('should make a code block from markdown shortcuts', () => {
    cy.get('.ProseMirror')
      .type('``` {enter}Code', { force: true })
      .contains('pre', 'Code')
  })
})