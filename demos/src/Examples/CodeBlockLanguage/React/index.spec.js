context('/src/Examples/CodeBlockLanguage/React/', () => {
  before(() => {
    cy.visit('/src/Examples/CodeBlockLanguage/React/')
  })

  it('should have hljs classes for syntax highlighting', () => {
    cy.get('[class^=hljs]').then(elements => {
      expect(elements.length).to.be.greaterThan(0)
    })
  })

  it('should have different count of hljs classes after switching language', () => {
    cy.get('[class^=hljs]').then(elements => {
      const initialCount = elements.length

      expect(initialCount).to.be.greaterThan(0)

      cy.wait(100)
      cy.get('.tiptap select').select('java')
      cy.wait(500)

      cy.get('[class^=hljs]').then(newElements => {
        const newCount = newElements.length

        expect(newCount).to.not.equal(initialCount)
      })
    })
  })
})
