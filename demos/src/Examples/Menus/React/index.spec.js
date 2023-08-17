context('/src/Examples/Menus/React/', () => {
  before(() => {
    cy.visit('/src/Examples/Menus/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.chain().focus().clearContent().run()
    })
  })

  it('should show menu when the editor is empty', () => {
    cy.get('#app')
      .find('[data-tippy-root]')
  })

  it('should show menu when text is selected', () => {
    cy.get('.tiptap')
      .type('Test')
      .type('{selectall}')

    cy.get('#app')
      .find('[data-tippy-root]')
  })

  const marks = [
    {
      button: 'Bold',
      tag: 'strong',
    },
    {
      button: 'Italic',
      tag: 'em',
    },
    {
      button: 'Strike',
      tag: 's',
    },
  ]

  marks.forEach(mark => {
    it(`should apply ${mark.button} correctly`, () => {
      cy.get('.tiptap')
        .type('Test')
        .type('{selectall}')

      cy.get('#app')
        .find('[data-tippy-root]')
        .contains(mark.button)
        .click()

      cy.get('.tiptap')
        .find(`p ${mark.tag}`)
    })
  })
})
