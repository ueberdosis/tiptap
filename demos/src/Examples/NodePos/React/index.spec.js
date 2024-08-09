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
      cy.get('div[data-testid="found-node"]').should('have.length', 3)
    })
  })

  it('should get images', () => {
    cy.get('.tiptap').then(() => {
      cy.get('button[data-testid="find-images"]').click()
      cy.get('div[data-testid="found-nodes"]').should('exist')
      cy.get('div[data-testid="found-node"]').should('have.length', 4)
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

  describe('when querying by attribute', () => {
    it('should get square image', () => {
      cy.get('.tiptap').then(() => {
        cy.get('button[data-testid="find-squared-image"]').click()
        cy.get('div[data-testid="found-nodes"]').should('exist')
        cy.get('div[data-testid="found-node"]').should('have.length', 1)
        cy.get('div[data-testid="found-node"]').should('contain', 'https://placehold.co/200x200')
      })
    })

    it('should get landsape image', () => {
      cy.get('.tiptap').then(() => {
        cy.get('button[data-testid="find-landscape-image"]').click()
        cy.get('div[data-testid="found-nodes"]').should('exist')
        cy.get('div[data-testid="found-node"]').should('have.length', 1)
        cy.get('div[data-testid="found-node"]').should('contain', 'https://placehold.co/260x200')
      })
    })

    it('should get all landscape images', () => {
      cy.get('.tiptap').then(() => {
        cy.get('button[data-testid="find-all-landscape-images"]').click()
        cy.get('div[data-testid="found-nodes"]').should('exist')
        cy.get('div[data-testid="found-node"]').should('have.length', 2)
        cy.get('div[data-testid="found-node"]').eq(0).should('contain', 'https://placehold.co/260x200')
        cy.get('div[data-testid="found-node"]').eq(1).should('contain', 'https://placehold.co/260x200')
      })
    })

    it('should get first landscape image with querySelectorAll', () => {
      cy.get('.tiptap').then(() => {
        cy.get('button[data-testid="find-first-landscape-image-with-all-query"]').click()
        cy.get('div[data-testid="found-nodes"]').should('exist')
        cy.get('div[data-testid="found-node"]').should('have.length', 1)
        cy.get('div[data-testid="found-node"]').should('contain', 'https://placehold.co/260x200')
      })
    })

    it('should get portrait image inside blockquote', () => {
      cy.get('.tiptap').then(() => {
        cy.get('button[data-testid="find-portrait-image-inside-blockquote"]').click()
        cy.get('div[data-testid="found-nodes"]').should('exist')
        cy.get('div[data-testid="found-node"]').should('have.length', 1)
        cy.get('div[data-testid="found-node"]').should('contain', 'https://placehold.co/100x200')
      })
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
      cy.get('div[data-testid="found-node"]').should('contain', 'image')

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
