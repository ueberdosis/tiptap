context('/src/Examples/Book/React/', () => {
  before(() => {
    cy.visit('/src/Examples/Book/React/')
  })

  it('should have a working tiptap instance', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      // eslint-disable-next-line
      expect(editor).to.not.be.null
    })
  })
})
