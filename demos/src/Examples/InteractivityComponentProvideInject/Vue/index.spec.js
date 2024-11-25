context('/src/Examples/InteractivityComponentProvideInject/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/InteractivityComponentProvideInject/Vue/')
  })

  it('should have a working tiptap instance', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      // eslint-disable-next-line
      expect(editor).to.not.be.null
    })
  })

  it('should render a custom node', () => {
    cy.get('.tiptap .vue-component').should('have.length', 1)
  })

  it('should have global and all injected values', () => {
    const expectedTexts = [
      'globalValue',
      'appValue',
      'indexValue',
      'editorValue',
    ]

    cy.get('.tiptap .vue-component p').each((p, index) => {
      cy.wrap(p).should('have.text', expectedTexts[index])
    })
  })
})
