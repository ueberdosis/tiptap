context('/api/extensions/italic', () => {
  before(() => {
    cy.visit('/api/extensions/italic')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').window().then(window => {
      const { editor } = window
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
      cy.wait(10)
    })
  })

  it('the button should make the selected text italic', () => {
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror').contains('em', 'Example Text')
  })

  it('the button should toggle the selected text italic', () => {
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror').type('{selectall}', { force: true })
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror em').should('not.exist')
  })

  it('the keyboard shortcut should make the selected text italic', () => {
    cy.get('.ProseMirror').type('{meta}i', { force: true })
    cy.get('.ProseMirror').contains('em', 'Example Text')
  })

  it('the keyboard shortcut should toggle the selected text italic', () => {
    cy.get('.ProseMirror').type('{meta}i', { force: true }).type('{meta}i', { force: true })
    cy.get('.ProseMirror em').should('not.exist')
  })
})