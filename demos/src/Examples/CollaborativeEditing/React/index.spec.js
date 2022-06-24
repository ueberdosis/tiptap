context('/src/Examples/CollaborativeEditing/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/CollaborativeEditing/React/')
  })

  /* it('should show the current room with participants', () => {
    cy.wait(6000)
    cy.get('.editor__status')
      .should('contain', 'rooms.')
      .should('contain', 'users online')
  })

  it('should allow user to change name', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('John Doe')
      cy.get('.editor__name > button').click()
      cy.wait(6000)
      cy.get('.editor__name').should('contain', 'John Doe')
    })
  }) */
})
