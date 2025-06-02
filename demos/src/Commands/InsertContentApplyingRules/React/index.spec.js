context('/src/Commands/InsertContentApplyingRules/React/', () => {
  before(() => {
    cy.visit('/src/Commands/InsertContentApplyingRules/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('should apply list InputRule', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertContent('-', {
        applyInputRules: true,
      })

      editor.commands.insertContent(' ', {
        applyInputRules: true,
      })

      cy.get('.tiptap').should('contain.html', '<ul><li><p><br class="ProseMirror-trailingBreak"></p></li></ul>')
    })
  })

  it('should apply markdown using a PasteRule', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertContentAt(1, '*This is an italic text*', {
        applyPasteRules: true,
      })

      cy.get('.tiptap').should('contain.html', '<p><em>This is an italic text</em></p>')
    })
  })
})
