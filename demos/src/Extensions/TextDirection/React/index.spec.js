context('/src/Extensions/TextDirection/React/', () => {
  before(() => {
    cy.visit('/src/Extensions/TextDirection/React/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>LTR Example Text</p>\n<p>متن راست به چپ</p>')
    })
  })

  it('should parse RTL text correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p dir="rtl">متن راست به چپ</p>')
      expect(editor.getHTML()).to.eq('<p dir="rtl">متن راست به چپ</p>')
    })
  })

  it('should parse LTR text correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p dir="ltr">LTR Example Text</p>')
      expect(editor.getHTML()).to.eq('<p dir="ltr">LTR Example Text</p>')
    })
  })

  it('should remove the dir attribute if node is empty', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p dir="ltr"></p>')
      expect(editor.getHTML()).to.eq('<p></p>')
    })
  })

  it('shouldn\'t change the dir attribute if it already has one', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p dir="rtl">LTR Example Text</p>')
      expect(editor.getHTML()).to.eq('<p dir="rtl">LTR Example Text</p>')
    })
  })

  it('should set the text direction to ltr on the 1st button', () => {
    cy.get('button:nth-child(1)').click()

    cy.get('.ProseMirror').find('#rtl-text').invoke('attr', 'dir').should('eq', 'ltr')
  })

  it('should set the text direction to rtl on the 2st button', () => {
    cy.get('button:nth-child(2)').click()

    cy.get('.ProseMirror').find('#ltr-text').invoke('attr', 'dir').should('eq', 'rtl')
  })
})
