context('/src/Examples/Menus/Vue/', () => {
  before(() => {
    cy.visit('/src/Examples/Menus/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.chain().focus().clearContent().run()
    })
  })

  it('should show menu when the editor is empty', () => {
    cy.get('body').find('.floating-menu')
  })

  it('should show menu when text is selected', () => {
    cy.get('.tiptap').type('Test').type('{selectall}')

    cy.get('body').find('.bubble-menu')
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
      cy.get('.tiptap').type('Test').type('{selectall}')

      cy.get('body').find('.bubble-menu').contains(mark.button).click()

      cy.get('.tiptap').find(`p ${mark.tag}`)
    })
  })
})
