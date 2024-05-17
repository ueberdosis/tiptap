context('/src/Examples/Book/Vue/', () => {
  before(() => {
    cy.visit('/src/Examples/Book/Vue/')
  })

  it('should have a working tiptap instance', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      // eslint-disable-next-line
      expect(editor).to.not.be.null
    })
  })
})
