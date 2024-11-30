context('/src/Examples/Performance/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/Performance/React/')
  })

  it('should have a working tiptap instance', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      // eslint-disable-next-line
      expect(editor).to.not.be.null
    })
  })
})
