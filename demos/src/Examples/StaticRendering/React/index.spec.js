context('/src/Examples/StaticRendering/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/StaticRendering/React/')
  })

  it('should have a working tiptap instance', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      // eslint-disable-next-line
      expect(editor).to.not.be.null
    })
  })
})
