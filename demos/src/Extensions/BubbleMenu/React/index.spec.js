context('/src/Extensions/BubbleMenu/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Extensions/BubbleMenu/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.chain().focus().clearContent().run()
    })
  })

  it('should show bubble menu when text is selected', () => {
    cy.get('.tiptap').type('Test selection').type('{selectall}')
    cy.get('body').find('[data-testid="styled-bubble-menu"]')
  })

  it('should apply styles and attributes to the actual bubble menu element', () => {
    cy.get('.tiptap').type('Test selection').type('{selectall}')

    // Check that the bubble menu appears
    cy.get('body').find('[data-testid="styled-bubble-menu"]').should('exist')

    // Verify that the data-testid attribute is applied to the actual bubble menu element
    cy.get('[data-testid="styled-bubble-menu"]').should('have.attr', 'data-testid', 'styled-bubble-menu')

    // Verify that the zIndex style is applied directly to the bubble menu element
    cy.get('[data-testid="styled-bubble-menu"]').should('have.css', 'z-index', '9999')

    // Verify that the className is applied to the bubble menu element
    cy.get('[data-testid="styled-bubble-menu"]').should('have.class', 'bubble-menu')
  })

  it('should allow bubble menu buttons to work', () => {
    cy.get('.tiptap').type('Test selection').type('{selectall}')

    // Click bold button in bubble menu
    cy.get('[data-testid="styled-bubble-menu"]').find('button').contains('Bold').click()

    // Check that text is now bold
    cy.get('.tiptap').find('strong').should('contain', 'Test selection')
  })
})
