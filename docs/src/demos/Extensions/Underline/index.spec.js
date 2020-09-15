context('/api/extensions/underline', () => {
  before(() => {
    cy.visit('/api/extensions/underline')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  it('the button should underline the selected text', () => {
    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .find('u')
      .should('contain', 'Example Text')
  })

  it('the button should toggle the selected text underline', () => {
    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .type('{selectall}')

    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .find('u')
      .should('not.exist')
  })

  it('the keyboard shortcut should underline the selected text', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'u' })
      .find('u')
      .should('contain', 'Example Text')
  })

  it('the keyboard shortcut should toggle the selected text underline', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'u' })
      .trigger('keydown', { modKey: true, key: 'u' })
      .find('u')
      .should('not.exist')
  })
})