context('/src/Examples/Savvy/Vue/', () => {
  before(() => {
    cy.visit('/src/Examples/Savvy/Vue/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  const tests = [
    ['(c)', '©'],
    ['->', '→'],
    ['>>', '»'],
    ['1/2', '½'],
    ['!=', '≠'],
    ['--', '—'],
    ['1x1', '1×1'],
    [':-) ', '🙂'],
    ['<3 ', '❤️'],
    ['>:P ', '😜'],
  ]

  tests.forEach(test => {
    it(`should parse ${test[0]} correctly`, () => {
      cy.get('.ProseMirror')
        .type(test[0])
        .should('contain', test[1])
    })
  })

  it('should parse hex colors correctly', () => {
    cy.get('.ProseMirror')
      .type('#FD9170')
      .find('.color')
  })
})
