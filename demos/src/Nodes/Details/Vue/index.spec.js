context('/src/Nodes/Details/Vue/', () => {
  before(() => {
    cy.visit('/src/Nodes/Details/Vue/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.ProseMirror').type('{selectall}')
    })
  })

  it('should parse details tags correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<details><summary>Summary</summary><p>Content</p></details>')
      expect(editor.getHTML()).to.eq('<details class="details"><summary>Summary</summary><div data-type="detailsContent"><p>Content</p></div></details>')
    })
  })

  it('should parse details tags without paragraphs correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<details><summary>Summary</summary>Content</details>')
      expect(editor.getHTML()).to.eq('<details class="details"><summary>Summary</summary><div data-type="detailsContent"><p>Content</p></div></details>')
    })
  })

  it('setDetails should make the selected line a details node', () => {
    cy.get('.ProseMirror [data-type="details"]')
      .should('not.exist')

    cy.get('button:first')
      .click()

    cy.get('.ProseMirror')
      .find('[data-type="details"] [data-type="detailsContent"]')
      .should('contain', 'Example Text')
  })

  it('unsetDetails should make the selected line a paragraph node', () => {
    cy.get('button:first')
      .click()

    cy.get('.ProseMirror [data-type="details"]')
      .should('exist')

    cy.get('button:nth-child(2)')
      .click()

    cy.get('.ProseMirror [data-type="details"]')
      .should('not.exist')
  })

  // TODO: can use click on button because cypress is mutating the button which leads to a re-render in ProseMirror
  // it('should toggle content', () => {
  //   cy.get('button:first')
  //     .click()

  //   cy.get('.ProseMirror [data-type="details"] [data-type="detailsContent"]')
  //     .should('not.be.visible')

  //   cy.get('.ProseMirror')
  //     .find('[data-type="details"] button').then($el => {
  //       console.log($el, Cypress.dom.isAttached($el))
  //     })
  //     .click()

  //   cy.get('.ProseMirror [data-type="details"] [data-type="detailsContent"]')
  //     .should('be.visible')
  // })

})
