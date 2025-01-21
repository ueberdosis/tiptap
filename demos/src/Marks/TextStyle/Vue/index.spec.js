context('/src/Marks/TextStyle/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/Marks/TextStyle/Vue/')
  })

  describe('mergeNestedSpanStyles', () => {
    it('should merge styles of a span with one child span', () => {
      cy.get('.tiptap > p:nth-child(4) > span')
        .should('have.length', 1)
        .and('have.text', 'red serif')
        .and('have.attr', 'style', 'color: rgb(255, 0, 0); font-family: serif')
    })
    it('should merge styles of a span with one nested child span into the descendant span', () => {
      cy.get('.tiptap > p:nth-child(5) > span')
        .should('have.length', 1)
        .and('have.text', 'blue serif')
        .and('have.attr', 'style', 'color: rgb(0, 0, 255); font-family: serif')
    })
    it('should merge styles of a span with multiple child spans into all child spans', () => {
      cy.get('.tiptap > p:nth-child(6) > span').should('have.length', 2)
      cy.get('.tiptap > p:nth-child(6) > span:nth-child(1)')
        .should('have.text', 'green serif ')
        .and('have.attr', 'style', 'color: rgb(0, 255, 0); font-family: serif')
      cy.get('.tiptap > p:nth-child(6) > span:nth-child(2)')
        .should('have.text', 'red serif')
        .and('have.attr', 'style', 'color: rgb(255, 0, 0); font-family: serif')
    })
    it('should merge styles of descendant spans into each descendant span when the parent span has no style', () => {
      cy.get('.tiptap > p:nth-child(7) > span').should('have.length', 4)
      cy.get('.tiptap > p:nth-child(7) > span:nth-child(1)')
        .should('have.text', 'blue')
        .and('have.attr', 'style', 'color: rgb(0, 0, 255)')
      cy.get('.tiptap > p:nth-child(7) > span:nth-child(2)')
        .should('have.text', 'green ')
        .and('have.attr', 'style', 'color: rgb(0, 255, 0)')
      cy.get('.tiptap > p:nth-child(7) > span:nth-child(3)')
        .should('have.text', 'green serif')
        .and('have.attr', 'style', 'color: rgb(0, 255, 0); font-family: serif')
    })
    it('should merge styles of a span with nested root text and descendant spans into each descendant span', () => {
      cy.get('.tiptap > p:nth-child(8) > span').should('have.length', 4)
      cy.get('.tiptap > p:nth-child(8) > span:nth-child(1)')
        .should('have.text', 'blue ')
        .and('have.attr', 'style', 'color: rgb(0, 0, 255)')
      cy.get('.tiptap > p:nth-child(8) > span:nth-child(2)')
        .should('have.text', 'green ')
        .and('have.attr', 'style', 'color: rgb(0, 255, 0)')
      cy.get('.tiptap > p:nth-child(8) > span:nth-child(3)')
        .should('have.text', 'green serif ')
        .and('have.attr', 'style', 'color: rgb(0, 255, 0); font-family: serif')
      cy.get('.tiptap > p:nth-child(8) > span:nth-child(4)')
        .should('have.text', 'blue serif')
        .and('have.attr', 'style', 'color: rgb(0, 0, 255); font-family: serif')
    })
    it('should merge styles of descendant spans into each descendant span when the parent span has other tags', () => {
      cy.get('.tiptap > p:nth-child(9) > span').should('have.length', 4)
      cy.get('.tiptap > p:nth-child(9) > :nth-child(1)')
        .should('have.prop', 'tagName', 'STRONG')
        .and('have.text', 'strong ')
      cy.get('.tiptap > p:nth-child(9) > span:nth-child(2)')
        .should('have.text', 'strong blue ')
        .and('have.attr', 'style', 'color: rgb(0, 0, 255)')
        .find('strong')
        .should('exist')
      cy.get('.tiptap > p:nth-child(9) > span:nth-child(3)')
        .should('have.text', 'strong blue serif ')
        .and('have.attr', 'style', 'color: rgb(0, 0, 255); font-family: serif; font-size: 24px')
        .find('strong')
        .should('exist')
      cy.get('.tiptap > p:nth-child(9) > span:nth-child(4)')
        .should('have.text', 'strong green ')
        .and('have.attr', 'style', 'color: rgb(0, 255, 0)')
        .find('strong')
        .should('exist')
      cy.get('.tiptap > p:nth-child(9) > span:nth-child(5)')
        .should('have.text', 'strong green serif')
        .and('have.attr', 'style', 'color: rgb(0, 255, 0); font-family: serif')
        .find('strong')
        .should('exist')
    })
  })
})
