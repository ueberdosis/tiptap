context('/api/extensions/italic', () => {
  before(() => {
    cy.visit('/api/extensions/italic')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  it('the button should make the selected text italic', () => {
    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .find('em')
      .should('contain', 'Example Text')
  })

  it('the button should toggle the selected text italic', () => {
    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .type('{selectall}')

    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror em')
      .should('not.exist')
  })

  it('the keyboard shortcut should make the selected text italic', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'i' })
      .find('em')
      .should('contain', 'Example Text')
  })

  it('the keyboard shortcut should toggle the selected text italic', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'i' })
      .trigger('keydown', { modKey: true, key: 'i' })
      .find('em')
      .should('not.exist')
  })
})