context('/src/Examples/Menus/React/', () => {
  before(() => {
    cy.visit('/src/Examples/Menus/React/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('should show menu when the editor is empty', () => {
    cy.get('.ProseMirror')
      .focus()

    cy.get('#app')
      .find('#tippy-2')
  })

  it('should show menu when text is selected', () => {
    cy.get('.ProseMirror')
      .type('Test')
      .type('{selectall}')

    cy.get('#app')
      .find('#tippy-1')
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
        .find('#tippy-1')
        .contains(mark.button)
        .click()

      cy.get('.ProseMirror')
        .find(`p ${mark.tag}`)
    })
  })
})
