context('/src/Experiments/GlobalDragHandle/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Experiments/GlobalDragHandle/React/')
  })

  it('should have working tiptap instances with correct configuration', () => {
    // Verify 2 editors exist
    cy.get('.tiptap').should('have.length', 2)
    cy.get('.editor-container').should('have.length', 2)

    // Verify both editors are editable
    cy.get('.editor-container').first().should('not.have.class', 'readonly') // Editor 1: Editable
    cy.get('.editor-container').eq(1).should('not.have.class', 'readonly') // Editor 2: Editable
  })

  it('should show drag handle on hover and have correct properties', () => {
    // Initially hidden
    cy.get('.drag-handle').should('not.be.visible')

    // Show on hover for first editor
    cy.get('.editor-container').first().find('.tiptap h2').trigger('mousemove')
    cy.get('.drag-handle').should('be.visible')
    cy.get('.drag-handle').should('have.attr', 'draggable', 'true')

    // Show on hover for second editor too
    cy.get('.editor-container').eq(1).find('.tiptap h2').trigger('mousemove')
    cy.get('.drag-handle').should('be.visible')
  })

  it('should allow editing in both editors', () => {
    // Both editors allow editing
    cy.get('.editor-container').first().find('.tiptap').click().type('{movetoend}{enter}Works in Editor 1!')
    cy.get('.editor-container').first().find('.tiptap').should('contain', 'Works in Editor 1!')

    cy.get('.editor-container').eq(1).find('.tiptap').click().type('{movetoend}{enter}Works in Editor 2!')
    cy.get('.editor-container').eq(1).find('.tiptap').should('contain', 'Works in Editor 2!')
  })

  // Note: Actual drag-and-drop testing in Cypress is complex and unreliable
  // The core DnD functionality is tested at the unit level in the extension code
  // These UI tests focus on verifying the basic infrastructure is working
})
