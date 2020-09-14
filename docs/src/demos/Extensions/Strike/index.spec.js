context('/api/extensions/strike', () => {
  before(() => {
    cy.visit('/api/extensions/strike')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  it('the button should strike the selected text', () => {
    cy.get('.demo__preview button:first')
      .click({ force: true })

    cy.get('.ProseMirror')
      .find('s')
      .should('contain', 'Example Text')
  })

  it('the button should toggle the selected text striked', () => {
    cy.get('.demo__preview button:first')
      .click({ force: true })

    cy.get('.ProseMirror')
      .type('{selectall}', { force: true })

    cy.get('.demo__preview button:first')
      .click({ force: true })

    cy.get('.ProseMirror')
      .find('s')
      .should('not.exist')
  })

  it('the keyboard shortcut should strike the selected text', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'd' })
      .find('s')
      .should('contain', 'Example Text')
  })

  it('the keyboard shortcut should toggle the selected text striked', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'd' })
      .trigger('keydown', { modKey: true, key: 'd' })
      .find('s')
      .should('not.exist')
  })

  it('should make a striked text from the markdown shortcut', () => {
    cy.get('.ProseMirror')
      .type('~Strike~', { force: true })
      .find('s')
      .should('contain', 'Strike')
  })
})