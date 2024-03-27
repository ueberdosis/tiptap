context('/src/Examples/HeadingMultipleMention/React/', () => {
  before(() => {
    cy.visit('/src/Examples/HeadingMultipleMention/React/')
  })
  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p></p>')
    })
  })

  it('selecting element from page link doesn\'t trigger heading', () => {
    cy.get('.tiptap')
      .type('\n#')
      .type('{downarrow}')
      .type('{enter}')
      .should('contain', 'Dogs page')
      .get('h1')
      .should('not.exist')
  })
  it('page link and user mention works together', () => {
    cy.get('.tiptap')
      .type('\n#')
      .type('{downarrow}')
      .type('{enter}')
      .should('contain', 'Dogs page')
      .type(' @')
      .type('{downarrow}')
      .type('{enter}')
      .should('contain', 'Cyndi Lauper')
      .get('h1')
      .should('not.exist')
  })
  it('can still trigger heading if nothing is selected from mention', () => {
    cy.get('.tiptap')
      .type('\n# Heading!')
      .get('h1')
      .should('contain', 'Heading!')

  })
})
