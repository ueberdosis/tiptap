context('React Context NodeViews', () => {
  before(() => {
    cy.visit('/examples/ReactContextNodeViews/React')
  })

  it('should load the demo', () => {
    cy.get('.react-context-demo').should('exist')
  })

  it('should have theme controls', () => {
    cy.get('.controls').should('exist')
    cy.contains('Theme Controls').should('exist')
  })

  it('should have nested NodeViews', () => {
    cy.get('.container-node').should('exist')
    cy.get('.themed-card').should('have.length.at.least', 1)
  })

  it('should update theme when clicking dark mode', () => {
    cy.contains('🌙 Dark').click()
    cy.get('.container-node.theme-dark').should('exist')
    cy.get('.themed-card.theme-dark').should('exist')
  })

  it('should update theme when clicking light mode', () => {
    cy.contains('☀️ Light').click()
    cy.get('.container-node.theme-light').should('exist')
    cy.get('.themed-card.theme-light').should('exist')
  })

  it('should update counter when clicking increment', () => {
    // Get initial count
    cy.get('.counter-display')
      .first()
      .invoke('text')
      .then(initialCount => {
        const count = parseInt(initialCount, 10)

        // Click increment
        cy.get('.controls button').contains('+').click()

        // Verify counter increased in controls
        cy.get('.counter-display').should('contain', count + 1)

        // Verify counter increased in container badge
        cy.get('.container-badge').should('contain', `Count: ${count + 1}`)
      })
  })

  it('should update counter in NodeViews when clicking their buttons', () => {
    // Click increment button inside a card
    cy.get('.themed-card .counter-btn').contains('+').first().click()

    // Verify the counter updated globally (in controls)
    cy.get('.controls .counter-display')
      .invoke('text')
      .then(text => {
        const count = parseInt(text, 10)
        expect(count).to.be.greaterThan(0)
      })
  })

  it('should show context values in nested cards', () => {
    cy.get('.themed-card .card-badge').should('exist')
    cy.get('.themed-card .card-badge').first().should('contain', 'theme')
  })
})
