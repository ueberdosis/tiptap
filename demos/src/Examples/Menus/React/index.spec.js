context('/src/Examples/Menus/React/', () => {
  before(() => {
    cy.visit('/src/Examples/Menus/React/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.chain().focus().clearContent().run()
    })
  })

  // TODO: fix test
  // it('should show menu when the editor is empty', () => {
  //   cy.get('#app')
  //     .find('[data-tippy-root]')
  // })

  it('should show menu when text is selected', () => {
    cy.get('.ProseMirror')
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
      cy.get('.ProseMirror')
        .type('Test')
        .type('{selectall}')

      cy.get('#app')
        .find('[data-tippy-root]')
        .contains(mark.button)
        .click()

      cy.get('.ProseMirror')
        .find(`p ${mark.tag}`)
    })
  })
})
