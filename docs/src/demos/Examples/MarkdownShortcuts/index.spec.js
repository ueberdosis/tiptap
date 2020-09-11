context('/examples/markdown-shortcuts', () => {
  beforeEach(() => {
    cy.visit('/examples/markdown-shortcuts')

    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.clearContent()
    })
  })

  it('should make a h1', () => {
    cy.get('.ProseMirror')
      .type('# Headline', { force: true })
      .contains('h1', 'Headline')
  })

  it('should make a h2', () => {
    cy.get('.ProseMirror')
      .type('## Headline', { force: true })
      .contains('h2', 'Headline')
  })

  it('should make a h3', () => {
    cy.get('.ProseMirror')
      .type('### Headline', { force: true })
      .contains('h3', 'Headline')
  })

  it('should make a h4', () => {
    cy.get('.ProseMirror')
      .type('#### Headline', { force: true })
      .contains('h4', 'Headline')
  })

  it('should make a h5', () => {
    cy.get('.ProseMirror')
      .type('##### Headline', { force: true })
      .contains('h5', 'Headline')
  })

  it('should make a h6', () => {
    cy.get('.ProseMirror')
      .type('###### Headline', { force: true })
      .contains('h6', 'Headline')
  })

  it('should create inline code', () => {
    cy.get('.ProseMirror')
      .type('`$foobar`', { force: true })
      .contains('code', '$foobar')
  })

  it.skip('should create a code block without language', () => {
    cy.get('.ProseMirror')
      .type('``` {enter}const foo = bar{enter}```', { force: true })
      .contains('pre', 'const foo = bar')
  })

  it.skip('should create a bullet list from asteriks', () => {
    cy.get('.ProseMirror')
      .type('* foobar', { force: true })
      .contains('ul', 'foobar')
  })

  it.skip('should create a bullet list from dashes', () => {
    cy.get('.ProseMirror')
      .type('- foobar', { force: true })
      .contains('ul', 'foobar')
  })

  it.skip('should create a bullet list from pluses', () => {
    cy.get('.ProseMirror')
      .type('+ foobar', { force: true })
      .contains('ul', 'foobar')
  })

  it.skip('should create a ordered list', () => {
    cy.get('.ProseMirror')
    .type('1. foobar', { force: true })
    .contains('ol', 'foobar')
  })

  it.skip('should create a blockquote', () => {
    cy.get('.ProseMirror')
    .type('> foobar', { force: true })
    .contains('blockquote', 'foobar')
  })
})