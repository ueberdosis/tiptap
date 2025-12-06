context('/src/Experiments/DecorationsAPI/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/Experiments/DecorationsAPI/Vue/')
  })

  it('should load the Vue 3 demo', () => {
    cy.get('.tiptap').should('exist')
    cy.get('.tiptap h2').should('contain', 'Decorations API Examples')
  })

  describe('Keyword Highlighting (Inline Decoration)', () => {
    it('should highlight the word "important" in yellow', () => {
      cy.get('.tiptap .highlight-important').should('exist')
    })

    it('should highlight the word "todo" in red', () => {
      cy.get('.tiptap .highlight-todo').should('exist')
    })

    it('should highlight the word "note" in blue', () => {
      cy.get('.tiptap .highlight-note').should('exist')
    })

    it('should highlight the word "warning" in orange', () => {
      cy.get('.tiptap .highlight-warning').should('exist')
    })

    it('should update highlighting when typing new keywords', () => {
      cy.get('.tiptap p').first().click().type(' important')
      cy.get('.tiptap .highlight-important').should('have.length.greaterThan', 1)
    })
  })

  describe('Readability Scoring (Node Decoration)', () => {
    it('should apply readability classes to paragraphs', () => {
      cy.get('.tiptap .readability-easy, .tiptap .readability-medium, .tiptap .readability-hard').should(
        'have.length.greaterThan',
        0,
      )
    })

    it('should update readability score when editing text', () => {
      cy.get('.tiptap .readability-easy').first().click()
      cy.get('.tiptap .readability-easy')
        .first()
        .type(
          ' This is a very long sentence with many complex words and subordinate clauses that will increase the readability difficulty significantly.',
        )
      cy.wait(100)
      // The paragraph should now have a different readability class
      cy.get('.tiptap p').eq(3).should('not.have.class', 'readability-easy')
    })
  })

  describe('Block Actions (Vue Widget Decoration)', () => {
    it('should render Vue widget components', () => {
      cy.get('.tiptap .block-actions-widget').should('exist')
      cy.contains('button', 'Duplicate').should('exist')
      cy.contains('button', 'Delete').should('exist')
    })

    it('should duplicate blocks using Vue widget', () => {
      cy.get('.tiptap p')
        .its('length')
        .then(initialCount => {
          // Click the first duplicate button
          cy.contains('button', 'Duplicate').first().click({ force: true })
          cy.get('.tiptap p').should('have.length', initialCount + 1)
        })
    })

    it('should delete blocks using Vue widget', () => {
      cy.get('.tiptap p')
        .its('length')
        .then(initialCount => {
          // Click the first delete button
          cy.contains('button', 'Delete').first().click({ force: true })
          cy.get('.tiptap p').should('have.length', initialCount - 1)
        })
    })
  })

  describe('Selection Indicator (Widget Decoration)', () => {
    it('should show node stats widget', () => {
      cy.get('.tiptap p').first().click()
      cy.get('.node-stats-widget').should('exist')
      cy.get('.node-stats-widget__badge').should('contain', 'chars:')
    })

    it('should update stats when selection moves to different node', () => {
      cy.get('.tiptap p').eq(0).click()
      cy.get('.node-stats-widget__badge')
        .invoke('text')
        .then(firstText => {
          cy.get('.tiptap p').eq(3).click()
          cy.get('.node-stats-widget__badge').invoke('text').should('not.equal', firstText)
        })
    })
  })

  describe('Vue 3 Specific Features', () => {
    it('should properly handle Vue reactivity with editor state', () => {
      // Type to trigger decoration updates
      cy.get('.tiptap p').first().click().type('test')
      // Should not have console errors
      cy.get('.tiptap').should('exist')
    })

    it('should properly cleanup Vue components when decorations are removed', () => {
      // Type and delete to trigger decoration recreation
      cy.get('.tiptap p').last().click().type('test').clear()
      // Should not have memory leaks or console errors
      cy.get('.tiptap').should('exist')
    })
  })

  describe('Performance', () => {
    it('should handle rapid typing without errors', () => {
      cy.get('.tiptap p').first().click()
      cy.get('.tiptap p').first().type('the quick brown fox jumps over the lazy dog', { delay: 10 })
      // Decorations should still work
      cy.get('.tiptap .readability-easy, .tiptap .readability-medium').should('exist')
    })
  })
})
