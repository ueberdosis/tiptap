context('/src/Examples/CollaborativeEditing/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/CollaborativeEditing/Vue/')
  })

  it('should show the current room with participants', () => {
    cy.get('.editor__status').then(status => {
      status.should('contain', 'rooms.')
      status.should('contain', 'users online')
    })
  })

  it('should allow user to change name', () => {
    cy.window().then(win => {
      cy.wait(5000)

      cy.stub(win, 'prompt').returns('John Doe')
      cy.get('.editor__name > button').click()
      cy.wait(1000)
      cy.get('.editor__name').should('contain', 'John Doe')
    })

  })
})
