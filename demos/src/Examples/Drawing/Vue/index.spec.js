context('/src/Examples/Drawing/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/Drawing/Vue/')
  })

  it('should have a working tiptap instance', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      // eslint-disable-next-line
      expect(editor).to.not.be.null
    })
  })

  it('should have a svg canvas', () => {
    cy.get('.ProseMirror svg').should('exist')
  })

  it('should draw on the svg canvas', () => {
    cy.get('.ProseMirror svg').should('exist')

    cy.wait(500)

    cy.get('input').then(inputs => {
      const color = inputs[0].value
      const size = inputs[1].value

      cy.get('.ProseMirror svg')
        .click()
        .trigger('mousedown', { pageX: 100, pageY: 100, which: 1 })
        .trigger('mousemove', { pageX: 200, pageY: 200, which: 1 })
        .trigger('mouseup')

      cy.get('.ProseMirror svg path')
        .should('exist')
        .should('have.attr', 'stroke-width', size)
        .should('have.attr', 'stroke', color.toUpperCase())
    })
  })
})
