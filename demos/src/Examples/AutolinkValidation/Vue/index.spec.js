context('/src/Examples/AutolinkValidation/Vue/', () => {
  before(() => {
    cy.visit('/src/Examples/AutolinkValidation/Vue/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').type('{selectall}{backspace}')
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

  it('valid links should get autolinked', () => {
    validLinks.forEach(([rawTextInput, textThatShouldBeLinked]) => {
      cy.get('.ProseMirror').type(`{selectall}{backspace}${rawTextInput}`)
      cy.get('.ProseMirror a').contains(textThatShouldBeLinked)
    })
  })

  it('invalid links should not get autolinked', () => {
    invalidLinks.forEach(rawTextInput => {
      cy.get('.ProseMirror').type(`{selectall}{backspace}${rawTextInput}`)
      cy.get('.ProseMirror a').should('not.exist')
    })
  })
})
