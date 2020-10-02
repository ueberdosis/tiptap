context('/api/extensions/highlight', () => {
  before(() => {
    cy.visit('/api/extensions/highlight')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  it('the button should highlight the selected text', () => {
    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .find('mark')
      .should('contain', 'Example Text')
  })

  it('the button should toggle the selected text highlighted', () => {
    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .type('{selectall}')

    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .find('mark')
      .should('not.exist')
  })

  it('the keyboard shortcut should highlight the selected text', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'e' })
      .find('mark')
      .should('contain', 'Example Text')
  })

  it('the keyboard shortcut should toggle the selected text highlighted', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'e' })
      .trigger('keydown', { modKey: true, key: 'e' })
      .find('mark')
      .should('not.exist')
  })
})
