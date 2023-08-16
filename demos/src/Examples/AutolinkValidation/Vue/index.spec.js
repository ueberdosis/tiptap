context('/src/Examples/AutolinkValidation/Vue/', () => {
  before(() => {
    cy.visit('/src/Examples/AutolinkValidation/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').type('{selectall}{backspace}')
  })

  const validLinks = [
    // [rawTextInput, textThatShouldBeLinked]
    ['https://tiptap.dev ', 'https://tiptap.dev'],
    ['http://tiptap.dev ', 'http://tiptap.dev'],
    ['https://www.tiptap.dev/ ', 'https://www.tiptap.dev/'],
    ['http://www.tiptap.dev/ ', 'http://www.tiptap.dev/'],
    ['[http://www.example.com/] ', 'http://www.example.com/'],
    ['(http://www.example.com/) ', 'http://www.example.com/'],
  ]

  const invalidLinks = [
    'tiptap.dev',
    'www.tiptap.dev',
    // If you don't type a space, don't autolink
    'https://tiptap.dev',
  ]

  validLinks.forEach(([rawTextInput, textThatShouldBeLinked]) => {
    it(`should autolink ${rawTextInput}`, () => {
      cy.get('.tiptap').type(rawTextInput)
      cy.get('.tiptap a').contains(textThatShouldBeLinked)
    })
  })

  invalidLinks.forEach(rawTextInput => {
    it(`should not autolink ${rawTextInput}`, () => {
      cy.get('.tiptap').type(`{selectall}{backspace}${rawTextInput}`)
      cy.get('.tiptap a').should('not.exist')
    })
  })
})
