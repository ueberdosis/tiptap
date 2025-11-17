context('/src/Experiments/DecorationsAPI/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Experiments/DecorationsAPI/React/')
  })

  it('should load the React demo', () => {
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
    it('should apply green border to easy-to-read paragraphs', () => {
      cy.get('.tiptap .readability-easy').should('exist')
    })

    it('should apply yellow border to medium complexity paragraphs', () => {
      cy.get('.tiptap .readability-medium').should('exist')
    })

    it('should apply red border to hard-to-read paragraphs', () => {
      cy.get('.tiptap .readability-hard').should('exist')
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

  describe('Block Actions (React Widget Decoration)', () => {
    it('should show block action buttons', () => {
      cy.get('.tiptap button').should('exist')
      cy.contains('button', 'Duplicate').should('exist')
      cy.contains('button', 'Delete').should('exist')
    })

    it('should duplicate a paragraph when clicking duplicate button', () => {
      cy.get('.tiptap p')
        .its('length')
        .then(initialCount => {
          // Click the first duplicate button
          cy.contains('button', 'Duplicate').first().click({ force: true })
          cy.get('.tiptap p').should('have.length', initialCount + 1)
        })
    })

    it('should delete a paragraph when clicking delete button', () => {
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
    it('should show selection stats when text is selected', () => {
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

    it('should show word count in stats', () => {
      cy.get('.tiptap p').first().click()
      cy.get('.node-stats-widget__badge').should('contain', 'words:')
    })

    it('should show sentence count in stats', () => {
      cy.get('.tiptap p').first().click()
      cy.get('.node-stats-widget__badge').should('contain', 'sentences:')
    })

    it('should show average word length in stats', () => {
      cy.get('.tiptap p').first().click()
      cy.get('.node-stats-widget__badge').should('contain', 'avg word:')
    })
  })

  describe('Performance and Re-rendering', () => {
    it('should not recreate all decorations on every keystroke', () => {
      cy.get('.tiptap p').first().click().type('test')
      // Decorations in other paragraphs should still exist
      cy.get('.tiptap .readability-easy, .tiptap .readability-medium, .tiptap .readability-hard').should(
        'have.length.greaterThan',
        0,
      )
    })

    it('should handle rapid typing without errors', () => {
      cy.get('.tiptap p').first().click()
      cy.get('.tiptap p').first().type('the quick brown fox jumps over the lazy dog', { delay: 10 })
      // Should not have any console errors and decorations should still work
      cy.get('.tiptap .highlight-important, .tiptap .readability-easy').should('exist')
    })
  })

  describe('Decoration Diffing', () => {
    it('should reuse decorations when content has not changed', () => {
      // Click on a different paragraph without changing content
      cy.get('.tiptap p').eq(0).click()
      cy.get('.tiptap p').eq(3).click()
      // All decorations should still exist and be correct
      cy.get('.tiptap .readability-easy, .tiptap .readability-medium, .tiptap .readability-hard').should(
        'have.length.greaterThan',
        0,
      )
    })

    it('should update decorations when content changes', () => {
      // Type a keyword to trigger inline decoration update
      cy.get('.tiptap p').last().click().type(' important')
      // New highlight should appear
      cy.get('.tiptap p')
        .last()
        .within(() => {
          cy.get('.highlight-important').should('exist')
        })
    })
  })
})
