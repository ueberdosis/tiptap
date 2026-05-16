import {
  editorEval,
  expect,
  getEditorHTML,
  getEditorJSON,
  getEditorText,
  pasteIntoEditor,
  pressShortcut,
  setEditorContent,
  test,
  typeInEditor,
  typeText,
  waitForEditor,
  withEditor,
} from '../../../../../tests/e2e/support/index.js'

test.describe('/src/Examples/NodePos/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/NodePos/React/')
  })

  test('should get paragraphs', async ({ page }) => {
    // TODO(playwright-migration): translate cy.get('.tiptap').then(arrow):
    // () => {
    //       cy.get('button[data-testid="find-paragraphs"]').click()
    //       cy.get('div[data-testid="found-nodes"]').should('exist')
    //       cy.get('div[data-testid="found-node"]').should('have.length', 16)
    //     }
  })

  test('should get list items', async ({ page }) => {
    // TODO(playwright-migration): translate cy.get('.tiptap').then(arrow):
    // () => {
    //       cy.get('button[data-testid="find-listitems"]').click()
    //       cy.get('div[data-testid="found-nodes"]').should('exist')
    //       cy.get('div[data-testid="found-node"]').should('have.length', 12)
    //     }
  })

  test('should get bullet lists', async ({ page }) => {
    // TODO(playwright-migration): translate cy.get('.tiptap').then(arrow):
    // () => {
    //       cy.get('button[data-testid="find-bulletlists"]').click()
    //       cy.get('div[data-testid="found-nodes"]').should('exist')
    //       cy.get('div[data-testid="found-node"]').should('have.length', 3)
    //     }
  })

  test('should get ordered lists', async ({ page }) => {
    // TODO(playwright-migration): translate cy.get('.tiptap').then(arrow):
    // () => {
    //       cy.get('button[data-testid="find-orderedlists"]').click()
    //       cy.get('div[data-testid="found-nodes"]').should('exist')
    //       cy.get('div[data-testid="found-node"]').should('have.length', 1)
    //     }
  })

  test('should get blockquotes', async ({ page }) => {
    // TODO(playwright-migration): translate cy.get('.tiptap').then(arrow):
    // () => {
    //       cy.get('button[data-testid="find-blockquotes"]').click()
    //       cy.get('div[data-testid="found-nodes"]').should('exist')
    //       cy.get('div[data-testid="found-node"]').should('have.length', 3)
    //     }
  })

  test('should get images', async ({ page }) => {
    // TODO(playwright-migration): translate cy.get('.tiptap').then(arrow):
    // () => {
    //       cy.get('button[data-testid="find-images"]').click()
    //       cy.get('div[data-testid="found-nodes"]').should('exist')
    //       cy.get('div[data-testid="found-node"]').should('have.length', 4)
    //     }
  })

  test('should get first blockquote', async ({ page }) => {
    // TODO(playwright-migration): translate cy.get('.tiptap').then(arrow):
    // () => {
    //       cy.get('button[data-testid="find-first-blockquote"]').click()
    //       cy.get('div[data-testid="found-nodes"]').should('exist')
    //       cy.get('div[data-testid="found-node"]').should('have.length', 1)
    //       cy.get('div[data-testid="found-node"]')
    //         .should('contain', 'Here we have a paragraph inside a blockquote.')
    //         .should('not.contain', 'Here we have another paragraph inside a blockquote.')
    //     }
  })

  test.describe('when querying by attribute', () => {
    test('should get square image', async ({ page }) => {
      // TODO(playwright-migration): translate cy.get('.tiptap').then(arrow):
      // () => {
      //         cy.get('button[data-testid="find-squared-image"]').click()
      //         cy.get('div[data-testid="found-nodes"]').should('exist')
      //         cy.get('div[data-testid="found-node"]').should('have.length', 1)
      //         cy.get('div[data-testid="found-node"]').should('contain', 'https://placehold.co/200x200')
      //       }
    })

    test('should get landsape image', async ({ page }) => {
      // TODO(playwright-migration): translate cy.get('.tiptap').then(arrow):
      // () => {
      //         cy.get('button[data-testid="find-landscape-image"]').click()
      //         cy.get('div[data-testid="found-nodes"]').should('exist')
      //         cy.get('div[data-testid="found-node"]').should('have.length', 1)
      //         cy.get('div[data-testid="found-node"]').should('contain', 'https://placehold.co/260x200')
      //       }
    })

    test('should get all landscape images', async ({ page }) => {
      // TODO(playwright-migration): translate cy.get('.tiptap').then(arrow):
      // () => {
      //         cy.get('button[data-testid="find-all-landscape-images"]').click()
      //         cy.get('div[data-testid="found-nodes"]').should('exist')
      //         cy.get('div[data-testid="found-node"]').should('have.length', 2)
      //         cy.get('div[data-testid="found-node"]').eq(0).should('contain', 'https://placehold.co/260x200')
      //         cy.get('div[data-testid="found-node"]').eq(1).should('contain', 'https://placehold.co/260x200')
      //       }
    })

    test('should get first landscape image with querySelectorAll', async ({ page }) => {
      // TODO(playwright-migration): translate cy.get('.tiptap').then(arrow):
      // () => {
      //         cy.get('button[data-testid="find-first-landscape-image-with-all-query"]').click()
      //         cy.get('div[data-testid="found-nodes"]').should('exist')
      //         cy.get('div[data-testid="found-node"]').should('have.length', 1)
      //         cy.get('div[data-testid="found-node"]').should('contain', 'https://placehold.co/260x200')
      //       }
    })

    test('should get portrait image inside blockquote', async ({ page }) => {
      // TODO(playwright-migration): translate cy.get('.tiptap').then(arrow):
      // () => {
      //         cy.get('button[data-testid="find-portrait-image-inside-blockquote"]').click()
      //         cy.get('div[data-testid="found-nodes"]').should('exist')
      //         cy.get('div[data-testid="found-node"]').should('have.length', 1)
      //         cy.get('div[data-testid="found-node"]').should('contain', 'https://placehold.co/100x200')
      //       }
    })
  })

  test('should find complex nodes', async ({ page }) => {
    // TODO(playwright-migration): translate cy.get('.tiptap').then(arrow):
    // () => {
    //       cy.get('button[data-testid="find-first-node"]').click()
    //       cy.get('div[data-testid="found-nodes"]').should('exist')
    //       cy.get('div[data-testid="found-node"]').should('have.length', 1)
    //       cy.get('div[data-testid="found-node"]').should('contain', 'heading').should('contain', '{"level":1}')
    //
    //       cy.get('button[data-testid="find-last-node"]').click()
    //       cy.get('div[data-testid="found-nodes"]').should('exist')
    //       cy.get('div[data-testid="found-node"]').should('have.length', 1)
    //       cy.get('div[data-testid="found-node"]').should('contain', 'image')
    //
    //       cy.get('button[data-testid="find-last-node-of-first-bullet-list"]').click()
    //       cy.get('div[data-testid="found-nodes"]').should('exist')
    //       cy.get('div[data-testid="found-node"]').should('have.length', 1)
    //       cy.get('div[data-testid="found-node"]').should('contain', 'listItem').should('contain', 'Unsorted 3')
    //     }
  })

  test('should not find nodes that do not exist in document', async ({ page }) => {
    // TODO(playwright-migration): translate cy.get('.tiptap').then(arrow):
    // () => {
    //       cy.get('button[data-testid="find-nonexistent-node"]').click()
    //       cy.get('div[data-testid="found-nodes"]').should('not.exist')
    //       cy.get('div[data-testid="found-node"]').should('have.length', 0)
    //     }
  })
})
