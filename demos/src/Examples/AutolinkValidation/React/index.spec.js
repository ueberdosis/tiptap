context('/src/Examples/AutolinkValidation/React/', () => {
  before(() => {
    cy.visit('/src/Examples/AutolinkValidation/React/')
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

  validLinks.forEach(link => {
    it(`${link[0]} should get autolinked`, () => {
      cy.get('.ProseMirror').type(link[0])
      cy.get('.ProseMirror').should('have.text', link[0])
      cy.get('.ProseMirror')
        .find('a')
        .should('have.length', 1)
        .should('have.attr', 'href', link[1])
    })
  })

  invalidLinks.forEach(link => {
    it(`${link} should NOT get autolinked`, () => {
      cy.get('.ProseMirror').type(link)
      cy.get('.ProseMirror').should('have.text', link)
      cy.get('.ProseMirror')
        .find('a')
        .should('have.length', 0)
    })
  })

  it('should not relink unset links after entering second link', () => {
    cy.get('.ProseMirror').type('https://tiptap.dev {home}')
    cy.get('.ProseMirror').should('have.text', 'https://tiptap.dev ')
    cy.get('[data-testid=unsetLink]').click()
    cy.get('.ProseMirror')
      .find('a')
      .should('have.length', 0)
    cy.get('.ProseMirror').type('{end}http://www.example.com/ ')
    cy.get('.ProseMirror')
      .find('a')
      .should('have.length', 1)
      .should('have.attr', 'href', 'http://www.example.com/')
  })

  it('should not relink unset links after hitting next paragraph', () => {
    cy.get('.ProseMirror').type('https://tiptap.dev {home}')
    cy.get('.ProseMirror').should('have.text', 'https://tiptap.dev ')
    cy.get('[data-testid=unsetLink]').click()
    cy.get('.ProseMirror')
      .find('a')
      .should('have.length', 0)
    cy.get('.ProseMirror').type('{end}typing other text should prevent the link from relinking when hitting enter{enter}')
    cy.get('.ProseMirror')
      .find('a')
      .should('have.length', 0)
  })

  it('should not relink unset links after modifying', () => {
    cy.get('.ProseMirror').type('https://tiptap.dev {home}')
    cy.get('.ProseMirror').should('have.text', 'https://tiptap.dev ')
    cy.get('[data-testid=unsetLink]').click()
    cy.get('.ProseMirror')
      .find('a')
      .should('have.length', 0)
    cy.get('.ProseMirror')
      .type('{home}')
      .type('{rightArrow}'.repeat('https://'.length))
      .type('blah')
    cy.get('.ProseMirror').should('have.text', 'https://blahtiptap.dev ')
    cy.get('.ProseMirror')
      .find('a')
      .should('have.length', 0)
  })

  it('should autolink after hitting enter (new paragraph)', () => {
    cy.get('.ProseMirror').type('https://tiptap.dev{enter}')
    cy.get('.ProseMirror').should('have.text', 'https://tiptap.dev')
    cy.get('.ProseMirror')
      .find('a')
      .should('have.length', 1)
      .should('have.attr', 'href', 'https://tiptap.dev')
  })

  it('should autolink after hitting shift-enter (hardbreak)', () => {
    cy.get('.ProseMirror').type('https://tiptap.dev{shift+enter}')
    cy.get('.ProseMirror').should('have.text', 'https://tiptap.dev')
    cy.get('.ProseMirror')
      .find('a')
      .should('have.length', 1)
      .should('have.attr', 'href', 'https://tiptap.dev')
  })
})
