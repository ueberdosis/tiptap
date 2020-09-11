context('/examples/focus', () => {
  before(() => {
    cy.visit('/examples/focus')
  })

  it('should have class', () => {
    cy.get('.ProseMirror').window().then(window => {
      const { editor } = window
      editor.focus('start')

      cy.get('.ProseMirror p:first').should('have.class', 'has-focus')
    })
  })
})