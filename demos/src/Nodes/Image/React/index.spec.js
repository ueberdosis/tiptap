context('/src/Nodes/Image/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Nodes/Image/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  it('should add an img tag with the correct URL', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('foobar.png')

      cy.get('button:first').click()

      cy.window().its('prompt').should('be.called')

      cy.get('.tiptap').find('img').should('have.attr', 'src', 'foobar.png')
    })
  })

  it('should verify resize handlers on the image node', () => {
    // Insert a pre-defined image content to ensure consistent testing
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<img src="test-image.jpg" alt="Test image" />')

      // Wait for the image to be properly rendered with its nodeview
      cy.wait(500)

      // Find the image container with data-node="image" attribute
      cy.get('.tiptap [data-node="image"]')
        .should('exist')
        .and('have.length', 1)
        .then($imageNode => {
          // Check for all resize handles
          const resizeHandles = [
            'left',
            'right',
            'top',
            'bottom',
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
          ]

          // Verify each resize handle exists with the correct position attribute
          resizeHandles.forEach(position => {
            cy.wrap($imageNode)
              .find(`.resize-handle-${position}`)
              .should('exist')
              .should('have.attr', 'data-position', position)
              .should('be.visible')
          })
        })
    })
  })
})
