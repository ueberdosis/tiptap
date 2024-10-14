context('/src/Examples/Transition/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/Transition/Vue/')
  })

  it('should not have an active tiptap instance but a button', () => {
    cy.get('.tiptap').should('not.exist')

    cy.get('button').should('exist')
  })

  it('clicking the button should show the editor', () => {
    cy.get('button').click()

    cy.get('.tiptap').should('exist')
    cy.get('.tiptap').should('be.visible')
  })

  it('clicking the button again should hide the editor', () => {
    cy.get('button').click()

    cy.get('.tiptap').should('exist')
    cy.get('.tiptap').should('be.visible')

    cy.get('button').click()

    cy.get('.tiptap').should('not.exist')
  })
})
