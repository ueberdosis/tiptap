context('/api/extensions/blockquote', () => {
  before(() => {
    cy.visit('/api/extensions/blockquote')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.focus()
      editor.selectAll()
    })
  })

  it('the button should make the selected line a blockquote', () => {
    cy.get('.ProseMirror blockquote').should('not.exist')
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror').find('blockquote').should('contain', 'Example Text')
  })

  it('the button should toggle the blockquote', () => {
    cy.get('.ProseMirror blockquote').should('not.exist')
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror').find('blockquote').should('contain', 'Example Text')

    cy.get('.ProseMirror').type('{selectall}', { force: true })
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror blockquote').should('not.exist')
  })

  it('the keyboard shortcut should make the selected line a blockquote', () => {
    cy.get('.ProseMirror').trigger('keydown', { shiftKey: true, metaKey: true, key: '9' })
    cy.get('.ProseMirror').find('blockquote').should('contain', 'Example Text')
  })

  it('the keyboard shortcut should toggle the blockquote', () => {
    cy.get('.ProseMirror blockquote').should('not.exist')
    cy.get('.ProseMirror').trigger('keydown', { shiftKey: true, metaKey: true, key: '9' })
    cy.get('.ProseMirror').find('blockquote').should('contain', 'Example Text')

    cy.get('.ProseMirror').type('{selectall}', { force: true })
    cy.get('.ProseMirror').trigger('keydown', { shiftKey: true, metaKey: true, key: '9' })
    cy.get('.ProseMirror blockquote').should('not.exist')
  })

  it('should make a blockquote from markdown shortcuts', () => {
    cy.get('.ProseMirror')
      .type('> Quote', { force: true })
      .find('blockquote')
      .should('contain', 'Quote')
  })
})