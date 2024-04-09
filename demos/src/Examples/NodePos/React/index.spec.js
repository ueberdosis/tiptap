context('/src/Examples/NodePos/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/NodePos/React/')
  })

  it('should get paragraphs', () => {
    cy.get('.tiptap').then(() => {
      cy.get('button[data-testid="find-paragraphs"]').click()
      cy.get('div[data-testid="found-nodes"]').should('exist')
      cy.get('div[data-testid="found-node"]').should('have.length', 16)
    })
  })

  it('should get list items', () => {
    cy.get('.tiptap').then(() => {
      cy.get('button[data-testid="find-listitems"]').click()
      cy.get('div[data-testid="found-nodes"]').should('exist')
      cy.get('div[data-testid="found-node"]').should('have.length', 12)
    })
  })

  it('should get bullet lists', () => {
    cy.get('.tiptap').then(() => {
      cy.get('button[data-testid="find-bulletlists"]').click()
      cy.get('div[data-testid="found-nodes"]').should('exist')
      cy.get('div[data-testid="found-node"]').should('have.length', 3)
    })
  })

  it('should get ordered lists', () => {
    cy.get('.tiptap').then(() => {
      cy.get('button[data-testid="find-orderedlists"]').click()
      cy.get('div[data-testid="found-nodes"]').should('exist')
      cy.get('div[data-testid="found-node"]').should('have.length', 1)
    })
  })

  it('should get blockquotes', () => {
    cy.get('.tiptap').then(() => {
      cy.get('button[data-testid="find-blockquotes"]').click()
      cy.get('div[data-testid="found-nodes"]').should('exist')
      cy.get('div[data-testid="found-node"]').should('have.length', 2)
    })
  })

  it('should get images', () => {
    cy.get('.tiptap').then(() => {
      cy.get('button[data-testid="find-images"]').click()
      cy.get('div[data-testid="found-nodes"]').should('exist')
      cy.get('div[data-testid="found-node"]').should('have.length', 2)
    })
  })

  it('should get first blockquote', () => {
    cy.get('.tiptap').then(() => {
      cy.get('button[data-testid="find-first-blockquote"]').click()
      cy.get('div[data-testid="found-nodes"]').should('exist')
      cy.get('div[data-testid="found-node"]').should('have.length', 1)
      cy.get('div[data-testid="found-node"]').should('contain', 'Here we have a paragraph inside a blockquote.').should('not.contain', 'Here we have another paragraph inside a blockquote.')
    })
  })

  it('should get images by attributes', () => {
    cy.get('.tiptap').then(() => {
      cy.get('button[data-testid="find-squared-image"]').click()
      cy.get('div[data-testid="found-nodes"]').should('exist')
      cy.get('div[data-testid="found-node"]').should('have.length', 1)
      cy.get('div[data-testid="found-node"]').should('contain', 'https://unsplash.it/200/200')

      cy.get('button[data-testid="find-landscape-image"]').click()
      cy.get('div[data-testid="found-nodes"]').should('exist')
      cy.get('div[data-testid="found-node"]').should('have.length', 1)
      cy.get('div[data-testid="found-node"]').should('contain', 'https://unsplash.it/260/200')
    })
  })

  it('should find complex nodes', () => {
    cy.get('.tiptap').then(() => {
      cy.get('button[data-testid="find-first-node"]').click()
      cy.get('div[data-testid="found-nodes"]').should('exist')
      cy.get('div[data-testid="found-node"]').should('have.length', 1)
      cy.get('div[data-testid="found-node"]').should('contain', 'heading').should('contain', '{"level":1}')

      cy.get('button[data-testid="find-last-node"]').click()
      cy.get('div[data-testid="found-nodes"]').should('exist')
      cy.get('div[data-testid="found-node"]').should('have.length', 1)
      cy.get('div[data-testid="found-node"]').should('contain', 'blockquote')

      cy.get('button[data-testid="find-last-node-of-first-bullet-list"]').click()
      cy.get('div[data-testid="found-nodes"]').should('exist')
      cy.get('div[data-testid="found-node"]').should('have.length', 1)
      cy.get('div[data-testid="found-node"]').should('contain', 'listItem').should('contain', 'Unsorted 3')
    })
  })

  it('should not find nodes that do not exist in document', () => {
    cy.get('.tiptap').then(() => {
      cy.get('button[data-testid="find-nonexistent-node"]').click()
      cy.get('div[data-testid="found-nodes"]').should('not.exist')
      cy.get('div[data-testid="found-node"]').should('have.length', 0)
    })
  })
})
