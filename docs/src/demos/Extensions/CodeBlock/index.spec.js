context('/api/extensions/code-block', () => {
  before(() => {
    cy.visit('/api/extensions/code-block')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  it('the button should make the selected line a code block', () => {
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror').find('pre').should('contain', 'Example Text')
  })

  it('the button should toggle the code block', () => {
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror').find('pre').should('contain', 'Example Text')

    cy.get('.ProseMirror').type('{selectall}', { force: true })
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror pre').should('not.exist')
  })

  it('the keyboard shortcut should make the selected line a code block', () => {
    cy.get('.ProseMirror').trigger('keydown', { shiftKey: true, ctrlKey: true, key: '\\' })
    cy.get('.ProseMirror').find('pre').should('contain', 'Example Text')
  })

  it('the keyboard shortcut should toggle the code block', () => {
    cy.get('.ProseMirror').trigger('keydown', { shiftKey: true, ctrlKey: true, key: '\\' })
    cy.get('.ProseMirror').find('pre').should('contain', 'Example Text')

    cy.get('.ProseMirror').type('{selectall}', { force: true })
    cy.get('.ProseMirror').trigger('keydown', { shiftKey: true, ctrlKey: true, key: '\\' })
    cy.get('.ProseMirror pre').should('not.exist')
  })

  it('should make a code block from markdown shortcuts', () => {
    cy.get('.ProseMirror')
      .type('``` {enter}Code', { force: true })
      .find('pre')
      .should('contain', 'Code')
  })
})