context('/src/Examples/Community/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/Community/React/')
  })

  it('should count the characters correctly', () => {
    // check if count text is "44/280 characters"
    cy.get('.character-count__text').should('have.text', '44/280 characters')

    // type in .tiptap
    cy.get('.tiptap').type(' Hello World')
    cy.get('.character-count__text').should('have.text', '56/280 characters')

    // remove content from .tiptap and enter text
    cy.get('.tiptap').type('{selectall}{backspace}Hello World')
    cy.get('.character-count__text').should('have.text', '11/280 characters')
  })

  it('should mention a user', () => {
    cy.get('.tiptap').type('{selectall}{backspace}@')

    // check if the mention autocomplete is visible
    cy.get('.tippy-content .items').should('be.visible')

    // select the first user
    cy.get('.tippy-content .items .item').first().then($el => {
      const name = $el.text()

      $el.click()

      // check if the user is mentioned
      cy.get('.tiptap').should('have.text', `@${name} `)
      cy.get('.character-count__text').should('have.text', '2/280 characters')
    })

  })
})
