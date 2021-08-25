context('/demos/Examples/MarkdownShortcuts/Vue', () => {
  before(() => {
    cy.visit('/demos/Examples/MarkdownShortcuts/Vue')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('should make a h1', () => {
    cy.get('.ProseMirror')
      .type('# Headline')
      .find('h1')
      .should('contain', 'Headline')
  })

  it('should make a h2', () => {
    cy.get('.ProseMirror')
      .type('## Headline')
      .find('h2')
      .should('contain', 'Headline')
  })

  it('should make a h3', () => {
    cy.get('.ProseMirror')
      .type('### Headline')
      .find('h3')
      .should('contain', 'Headline')
  })

  it('should make a h4', () => {
    cy.get('.ProseMirror')
      .type('#### Headline')
      .find('h4')
      .should('contain', 'Headline')
  })

  it('should make a h5', () => {
    cy.get('.ProseMirror')
      .type('##### Headline')
      .find('h5')
      .should('contain', 'Headline')
  })

  it('should make a h6', () => {
    cy.get('.ProseMirror')
      .type('###### Headline')
      .find('h6')
      .should('contain', 'Headline')
  })

  it('should create inline code', () => {
    cy.get('.ProseMirror')
      .type('`$foobar`')
      .find('code')
      .should('contain', '$foobar')
  })

  it('should create a code block without language', () => {
    cy.get('.ProseMirror')
      .type('``` {enter}const foo = bar{enter}```')
      .find('pre')
      .should('contain', 'const foo = bar')
  })

  it('should create a bullet list from asteriks', () => {
    cy.get('.ProseMirror')
      .type('* foobar')
      .find('ul')
      .should('contain', 'foobar')
  })

  it('should create a bullet list from dashes', () => {
    cy.get('.ProseMirror')
      .type('- foobar')
      .find('ul')
      .should('contain', 'foobar')
  })

  it('should create a bullet list from pluses', () => {
    cy.get('.ProseMirror')
      .type('+ foobar')
      .find('ul')
      .should('contain', 'foobar')
  })

  it('should create a ordered list', () => {
    cy.get('.ProseMirror')
      .type('1. foobar')
      .find('ol')
      .should('contain', 'foobar')
  })

  it('should create a blockquote', () => {
    cy.get('.ProseMirror')
      .type('> foobar')
      .find('blockquote')
      .should('contain', 'foobar')
  })
})
