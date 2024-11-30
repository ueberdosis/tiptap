context('/src/Examples/AutolinkValidation/React/', () => {
  before(() => {
    cy.visit('/src/Examples/AutolinkValidation/React/')
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

  it('should not relink unset links after entering second link', () => {
    cy.get('.tiptap').type('https://tiptap.dev {home}')
    cy.get('.tiptap').should('have.text', 'https://tiptap.dev ')
    cy.get('[data-testid=unsetLink]').click()
    cy.get('.tiptap')
      .find('a')
      .should('have.length', 0)
    cy.get('.tiptap').type('{end}http://www.example.com/ ')
    cy.get('.tiptap')
      .find('a')
      .should('have.length', 1)
      .should('have.attr', 'href', 'http://www.example.com/')
  })

  it('should not relink unset links after hitting next paragraph', () => {
    cy.get('.tiptap').type('https://tiptap.dev {home}')
    cy.get('.tiptap').should('have.text', 'https://tiptap.dev ')
    cy.get('[data-testid=unsetLink]').click()
    cy.get('.tiptap')
      .find('a')
      .should('have.length', 0)
    cy.get('.tiptap').type('{end}typing other text should prevent the link from relinking when hitting enter{enter}')
    cy.get('.tiptap')
      .find('a')
      .should('have.length', 0)
  })

  it('should not relink unset links after modifying', () => {
    cy.get('.tiptap').type('https://tiptap.dev {home}')
    cy.get('.tiptap').should('have.text', 'https://tiptap.dev ')
    cy.get('[data-testid=unsetLink]').click()
    cy.get('.tiptap')
      .find('a')
      .should('have.length', 0)
    cy.get('.tiptap')
      .type('{home}')
      .type('{rightArrow}'.repeat('https://'.length))
      .type('blah')
    cy.get('.tiptap').should('have.text', 'https://blahtiptap.dev ')
    cy.get('.tiptap')
      .find('a')
      .should('have.length', 0)
  })

  it('should autolink after hitting enter (new paragraph)', () => {
    cy.get('.tiptap').type('https://tiptap.dev{enter}')
    cy.get('.tiptap').should('have.text', 'https://tiptap.dev')
    cy.get('.tiptap')
      .find('a')
      .should('have.length', 1)
      .should('have.attr', 'href', 'https://tiptap.dev')
  })

  it('should autolink after hitting shift-enter (hardbreak)', () => {
    cy.get('.tiptap').type('https://tiptap.dev{shift+enter}')
    cy.get('.tiptap').should('have.text', 'https://tiptap.dev')
    cy.get('.tiptap')
      .find('a')
      .should('have.length', 1)
      .should('have.attr', 'href', 'https://tiptap.dev')
  })
})
