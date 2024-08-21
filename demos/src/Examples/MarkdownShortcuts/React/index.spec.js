context('/src/Examples/MarkdownShortcuts/React/', () => {
  before(() => {
    cy.visit('/src/Examples/MarkdownShortcuts/React/')
  })

  beforeEach(() => {
    cy.resetEditor()
  })

  it('should make a h1', () => {
    cy.get('.tiptap')
      .realType('# Headline')
    cy.get('.tiptap')
      .find('h1')
      .should('contain', 'Headline')
  })

  it('should make a h2', () => {
    cy.get('.tiptap')
      .realType('## Headline')
    cy.get('.tiptap')
      .find('h2')
      .should('contain', 'Headline')
  })

  it('should make a h3', () => {
    cy.get('.tiptap')
      .realType('### Headline')
    cy.get('.tiptap')
      .find('h3')
      .should('contain', 'Headline')
  })

  it('should make a h4', () => {
    cy.get('.tiptap')
      .realType('#### Headline')
    cy.get('.tiptap')
      .find('h4')
      .should('contain', 'Headline')
  })

  it('should make a h5', () => {
    cy.get('.tiptap')
      .realType('##### Headline')
    cy.get('.tiptap')
      .find('h5')
      .should('contain', 'Headline')
  })

  it('should make a h6', () => {
    cy.get('.tiptap')
      .realType('###### Headline')
    cy.get('.tiptap')
      .find('h6')
      .should('contain', 'Headline')
  })

  it('should create inline code', () => {
    cy.get('.tiptap')
      .realType('`$foobar`')
    cy.get('.tiptap')
      .find('code')
      .should('contain', '$foobar')
  })

  it('should create a code block without language', () => {
    cy.get('.tiptap')
      .realType('``` {enter}const foo = bar{enter}```')
    cy.get('.tiptap')
      .find('pre')
      .should('contain', 'const foo = bar')
  })

  it('should create a bullet list from asteriks', () => {
    cy.get('.tiptap')
      .realType('* foobar')
    cy.get('.tiptap')
      .find('ul')
      .should('contain', 'foobar')
  })

  it('should create a bullet list from dashes', () => {
    cy.get('.tiptap')
      .realType('- foobar')
    cy.get('.tiptap')
      .find('ul')
      .should('contain', 'foobar')
  })

  it('should create a bullet list from pluses', () => {
    cy.get('.tiptap')
      .realType('+ foobar')
    cy.get('.tiptap')
      .find('ul')
      .should('contain', 'foobar')
  })

  it('should create a ordered list', () => {
    cy.get('.tiptap')
      .realType('1. foobar')
    cy.get('.tiptap')
      .find('ol')
      .should('contain', 'foobar')
  })

  it('should create a blockquote', () => {
    cy.get('.tiptap')
      .realType('> foobar')
    cy.get('.tiptap')
      .find('blockquote')
      .should('contain', 'foobar')
  })
})
