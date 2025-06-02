context('/src/Extensions/FloatingMenu/React/', () => {
  before(() => {
    cy.visit('/src/Extensions/FloatingMenu/React/')
  })

  it('should not render a floating menu on non-empty nodes', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.chain().setContent('<p>Example Text</p>').focus().run()
      const floatingMenu = cy.get('[data-testID="floating-menu"]')

      floatingMenu.should('not.exist')
    })
  })

  it('should render a floating menu on empty nodes', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.chain().setContent('<p></p>').focus().run()
      const floatingMenu = cy.get('[data-testID="floating-menu"]')

      floatingMenu.should('exist')
    })
  })

  it('should not render a floating menu when a leaf node is inserted', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.chain().setContent('<p></p>').focus().run()

      cy.get('[data-testID="insert-foo"]').click()

      const floatingMenu = cy.get('[data-testID="floating-menu"]')

      floatingMenu.should('not.exist')
    })
  })
})
