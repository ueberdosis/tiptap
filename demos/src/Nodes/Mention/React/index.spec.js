context('/src/Nodes/Mention/React/', () => {
  before(() => {
    cy.visit('/src/Nodes/Mention/React/')
  })

  it('should insert a mention', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><span data-type="mention" data-id="1" data-label="John Doe">@John Doe</span></p>')
      cy.get('.tiptap').should(
        'contain.html',
        '<span class="mention" data-type="mention" data-id="1" data-label="John Doe" data-mention-suggestion-char="@" contenteditable="false">@John Doe</span>',
      )
    })
  })

  it('should insert multiple mentions', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent(
        '<p><span data-type="mention" data-id="1" data-label="John Doe">@John Doe</span> and <span data-type="mention" data-id="2" data-label="Jane Smith">@Jane Smith</span></p>',
      )
      cy.get('.tiptap').should(
        'contain.html',
        '<span class="mention" data-type="mention" data-id="1" data-label="John Doe" data-mention-suggestion-char="@" contenteditable="false">@John Doe</span> and <span class="mention" data-type="mention" data-id="2" data-label="Jane Smith" data-mention-suggestion-char="@" contenteditable="false">@Jane Smith</span>',
      )
    })
  })

  it("should open a dropdown menu when I type '@'", () => {
    cy.get('.tiptap').type('{selectall}{backspace}@')
    cy.get('.dropdown-menu').should('exist')
  })

  it('should display the correct options in the dropdown menu', () => {
    cy.get('.tiptap').type('{selectall}{backspace}@')
    cy.get('.dropdown-menu').should('exist')
    cy.get('.dropdown-menu button').should('have.length', 5)
    cy.get('.dropdown-menu button:nth-child(1)').should('contain.text', 'Lea Thompson').and('have.class', 'is-selected')
    cy.get('.dropdown-menu button:nth-child(2)').should('contain.text', 'Cyndi Lauper')
    cy.get('.dropdown-menu button:nth-child(3)').should('contain.text', 'Tom Cruise')
    cy.get('.dropdown-menu button:nth-child(4)').should('contain.text', 'Madonna')
    cy.get('.dropdown-menu button:nth-child(5)').should('contain.text', 'Jerry Hall')
  })

  it('should insert Cyndi Lauper mention when clicking on her option', () => {
    cy.get('.tiptap').type('{selectall}{backspace}@')
    cy.get('.dropdown-menu').should('exist')
    cy.get('.dropdown-menu button:nth-child(2)').contains('Cyndi Lauper').click()

    cy.get('.tiptap').should(
      'contain.html',
      '<span class="mention" data-type="mention" data-id="Cyndi Lauper" data-mention-suggestion-char="@" contenteditable="false">@Cyndi Lauper</span>',
    )
  })

  it('should close the dropdown menu when I move the cursor outside the editor', () => {
    cy.get('.tiptap').type('{selectall}{backspace}@')
    cy.get('.dropdown-menu').should('exist')
    cy.get('.tiptap').type('{moveToStart}')
    cy.get('.dropdown-menu').should('not.exist')
  })

  it('should close the dropdown menu when I press the exit key', () => {
    cy.get('.tiptap').type('{selectall}{backspace}@')
    cy.get('.dropdown-menu').should('exist')
    cy.get('.tiptap').type('{esc}')
    cy.get('.dropdown-menu').should('not.exist')
  })

  it('should insert Tom Cruise when selecting his option with the arrow keys and pressing the enter key', () => {
    cy.get('.tiptap').type('{selectall}{backspace}@')
    cy.get('.dropdown-menu').should('exist')
    cy.get('.tiptap').type('{downarrow}{downarrow}')
    cy.get('.dropdown-menu button:nth-child(3)').should('have.class', 'is-selected')
    cy.get('.tiptap').type('{enter}')

    cy.get('.tiptap').should(
      'contain.html',
      '<span class="mention" data-type="mention" data-id="Tom Cruise" data-mention-suggestion-char="@" contenteditable="false">@Tom Cruise</span>',
    )
  })

  it('should show a "No result" message when I search for an option that is not in the list', () => {
    cy.get('.tiptap').type('{selectall}{backspace}@nonexistent')
    cy.get('.dropdown-menu').should('exist')
    cy.get('.dropdown-menu').should('contain.text', 'No result')
  })

  it('should not hide the dropdown or insert any mention if I search for an option that is not in the list and hit enter', () => {
    cy.get('.tiptap').type('{selectall}{backspace}@nonexistent')
    cy.get('.dropdown-menu').should('exist')
    cy.get('.dropdown-menu').should('contain.text', 'No result')
    cy.get('.tiptap').type('{enter}')
    cy.get('.dropdown-menu').should('exist')
    cy.get('.tiptap').should('have.text', '@nonexistent')
    cy.get('.tiptap span.mention').should('not.exist')
  })

  it('should only show the Madonna option in the dropdown when I type "@mado"', () => {
    cy.get('.tiptap').type('{selectall}{backspace}@mado')
    cy.get('.dropdown-menu').should('exist')
    cy.get('.dropdown-menu button').should('have.length', 1)
    cy.get('.dropdown-menu button:nth-child(1)').should('contain.text', 'Madonna')
  })

  it('should insert Madonna when I type "@mado" and hit enter', () => {
    cy.get('.tiptap').type('{selectall}{backspace}@mado{enter}')
    cy.get('.tiptap').should(
      'contain.html',
      '<span class="mention" data-type="mention" data-id="Madonna" data-mention-suggestion-char="@" contenteditable="false">@Madonna</span>',
    )
  })
})
