context('/api/extensions/hard-break', () => {
  before(() => {
    cy.visit('/api/extensions/hard-break')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
    })
  })

  it('the button should add a line break', () => {
    cy.get('.ProseMirror br').should('not.exist')
    cy.get('.demo__preview button:first').click({ force: true })
    cy.get('.ProseMirror br').should('exist')
  })

  it('the default keyboard shortcut should add a line break', () => {
    cy.get('.ProseMirror br').should('not.exist')
    cy.get('.ProseMirror').type('{shift}{enter}', { force: true })
    cy.get('.ProseMirror br').should('exist')
  })

  it('the alternative keyboard shortcut should add a line break', () => {
    cy.get('.ProseMirror br').should('not.exist')
    cy.get('.ProseMirror').type('{meta}{enter}', { force: true })
    cy.get('.ProseMirror br').should('exist')
  })
})