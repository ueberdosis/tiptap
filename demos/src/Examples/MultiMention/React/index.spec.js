context('/src/Examples/MultiMention/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/MultiMention/React/')
  })

  describe('Person mentions (@)', () => {
    it('should insert a person mention', () => {
      cy.get('.tiptap').then(([{ editor }]) => {
        editor.commands.setContent('<p><span data-type="mention" data-id="Lea Thompson">@Lea Thompson</span></p>')
        cy.get('.tiptap').should(
          'contain.html',
          '<span class="mention" data-type="mention" data-id="Lea Thompson" data-mention-suggestion-char="@" contenteditable="false">@Lea Thompson</span>',
        )
      })
    })

    it("should open a dropdown menu when I type '@'", () => {
      cy.get('.tiptap').type('{selectall}{backspace}@')
      cy.get('.dropdown-menu').should('exist')
    })

    it('should display the correct person options in the dropdown menu', () => {
      cy.get('.tiptap').type('{selectall}{backspace}@')
      cy.get('.dropdown-menu').should('exist')
      cy.get('.dropdown-menu button').should('have.length', 5)
      cy.get('.dropdown-menu button:nth-child(1)')
        .should('contain.text', 'Lea Thompson')
        .and('have.class', 'is-selected')
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

    it('should close the dropdown menu when I press the escape key', () => {
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

    it('should show a "No result" message when I search for a person that is not in the list', () => {
      cy.get('.tiptap').type('{selectall}{backspace}@nonexistent')
      cy.get('.dropdown-menu').should('exist')
      cy.get('.dropdown-menu').should('contain.text', 'No result')
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

  describe('Movie mentions (#)', () => {
    it('should insert a movie mention', () => {
      cy.get('.tiptap').then(([{ editor }]) => {
        editor.commands.setContent(
          '<p><span data-type="mention" data-id="The Matrix" data-mention-suggestion-char="#">#The Matrix</span></p>',
        )
        cy.get('.tiptap').should(
          'contain.html',
          '<span class="mention" data-type="mention" data-id="The Matrix" data-mention-suggestion-char="#" contenteditable="false">#The Matrix</span>',
        )
      })
    })

    it("should open a dropdown menu when I type '#'", () => {
      cy.get('.tiptap').type('{selectall}{backspace}#')
      cy.get('.dropdown-menu').should('exist')
    })

    it('should display the correct movie options in the dropdown menu', () => {
      cy.get('.tiptap').type('{selectall}{backspace}#')
      cy.get('.dropdown-menu').should('exist')
      cy.get('.dropdown-menu button').should('have.length', 3)
      cy.get('.dropdown-menu button:nth-child(1)')
        .should('contain.text', 'Dirty Dancing')
        .and('have.class', 'is-selected')
      cy.get('.dropdown-menu button:nth-child(2)').should('contain.text', 'Pirates of the Caribbean')
      cy.get('.dropdown-menu button:nth-child(3)').should('contain.text', 'The Matrix')
    })

    it('should insert Pirates of the Caribbean mention when clicking on its option', () => {
      cy.get('.tiptap').type('{selectall}{backspace}#')
      cy.get('.dropdown-menu').should('exist')
      cy.get('.dropdown-menu button:nth-child(2)').contains('Pirates of the Caribbean').click()

      cy.get('.tiptap').should(
        'contain.html',
        '<span class="mention" data-type="mention" data-id="Pirates of the Caribbean" data-mention-suggestion-char="#" contenteditable="false">#Pirates of the Caribbean</span>',
      )
    })

    it('should close the dropdown menu when I move the cursor outside the editor', () => {
      cy.get('.tiptap').type('{selectall}{backspace}#')
      cy.get('.dropdown-menu').should('exist')
      cy.get('.tiptap').type('{moveToStart}')
      cy.get('.dropdown-menu').should('not.exist')
    })

    it('should close the dropdown menu when I press the escape key', () => {
      cy.get('.tiptap').type('{selectall}{backspace}#')
      cy.get('.dropdown-menu').should('exist')
      cy.get('.tiptap').type('{esc}')
      cy.get('.dropdown-menu').should('not.exist')
    })

    it('should insert The Matrix when selecting its option with the arrow keys and pressing the enter key', () => {
      cy.get('.tiptap').type('{selectall}{backspace}#')
      cy.get('.dropdown-menu').should('exist')
      cy.get('.tiptap').type('{downarrow}{downarrow}')
      cy.get('.dropdown-menu button:nth-child(3)').should('have.class', 'is-selected')
      cy.get('.tiptap').type('{enter}')

      cy.get('.tiptap').should(
        'contain.html',
        '<span class="mention" data-type="mention" data-id="The Matrix" data-mention-suggestion-char="#" contenteditable="false">#The Matrix</span>',
      )
    })

    it('should show a "No result" message when I search for a movie that is not in the list', () => {
      cy.get('.tiptap').type('{selectall}{backspace}#nonexistent')
      cy.get('.dropdown-menu').should('exist')
      cy.get('.dropdown-menu').should('contain.text', 'No result')
    })

    it('should only show the Dirty Dancing option in the dropdown when I type "#dir"', () => {
      cy.get('.tiptap').type('{selectall}{backspace}#dir')
      cy.get('.dropdown-menu').should('exist')
      cy.get('.dropdown-menu button').should('have.length', 1)
      cy.get('.dropdown-menu button:nth-child(1)').should('contain.text', 'Dirty Dancing')
    })

    it('should insert Dirty Dancing when I type "#dir" and hit enter', () => {
      cy.get('.tiptap').type('{selectall}{backspace}#dir{enter}')
      cy.get('.tiptap').should(
        'contain.html',
        '<span class="mention" data-type="mention" data-id="Dirty Dancing" data-mention-suggestion-char="#" contenteditable="false">#Dirty Dancing</span>',
      )
    })
  })

  describe('Interaction between mention types', () => {
    it('should support both mention types in the same document', () => {
      cy.get('.tiptap').then(([{ editor }]) => {
        editor.commands.setContent(
          '<p><span data-type="mention" data-id="Madonna">@Madonna</span> starred in <span data-type="mention" data-id="Dirty Dancing" data-mention-suggestion-char="#">#Dirty Dancing</span></p>',
        )

        cy.get('.tiptap').should(
          'contain.html',
          '<span class="mention" data-type="mention" data-id="Madonna" data-mention-suggestion-char="@" contenteditable="false">@Madonna</span>',
        )
        cy.get('.tiptap').should(
          'contain.html',
          '<span class="mention" data-type="mention" data-id="Dirty Dancing" data-mention-suggestion-char="#" contenteditable="false">#Dirty Dancing</span>',
        )
      })
    })

    it('should allow switching between mention types', () => {
      cy.get('.tiptap').type('{selectall}{backspace}@')
      cy.get('.dropdown-menu').should('exist')
      cy.get('.dropdown-menu button:nth-child(1)').should('contain.text', 'Lea Thompson')

      // Close the dropdown by moving cursor
      cy.get('.tiptap').type('{moveToStart}')
      cy.get('.dropdown-menu').should('not.exist')

      // Open a new dropdown with #
      cy.get('.tiptap').type('{selectall}{backspace}#')
      cy.get('.dropdown-menu').should('exist')
      cy.get('.dropdown-menu button:nth-child(1)').should('contain.text', 'Dirty Dancing')
    })

    it('should insert both types of mentions in sequence', () => {
      cy.get('.tiptap').type('{selectall}{backspace}@mado{enter} likes #the{enter}')

      cy.get('.tiptap').should(
        'contain.html',
        '<span class="mention" data-type="mention" data-id="Madonna" data-mention-suggestion-char="@" contenteditable="false">@Madonna</span>  likes <span class="mention" data-type="mention" data-id="The Matrix" data-mention-suggestion-char="#" contenteditable="false">#The Matrix</span>',
      )
    })
  })
})
