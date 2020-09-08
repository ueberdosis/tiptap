context('/examples/focus', () => {
  beforeEach(() => {
    cy.visit('/examples/focus')
  })

  describe('focus class', () => {
    it('should have class', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window
        editor.focus('start')

        cy.get('.ProseMirror p:first').should('have.class', 'has-focus')
      })
    })
  })
})