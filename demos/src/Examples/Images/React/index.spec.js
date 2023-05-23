context('/src/Examples/Images/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/Images/React/')
  })

  it('finds image elements inside editor', () => {
    cy.get('.tiptap img').should('have.length', 2)
  })

  it('allows removing images', () => {
    cy.get('.tiptap img').should('have.length', 2)
    cy.get('.tiptap img').first().trigger('mousedown', { which: 1 })
    cy.get('.tiptap').type('{backspace}')
    cy.get('.tiptap img').should('have.length', 1)
  })

  it('allows images to be added via URL', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('https://unsplash.it/250/250')
      cy.get('button').contains('add image from URL').click({ force: false })
      cy.get('.tiptap img').should('have.length', 3)
    })
  })
})
