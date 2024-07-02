/// <reference types="cypress" />

import { Editor } from '@tiptap/core'

interface EditorElement extends HTMLElement {
  editor: Editor
}
context('/cypress/integration/Issue4327/React/', () => {
  before(() => {
    cy.visit('/src/Examples/Issue4327/React/')
  })
  it('should not show menu when node has renderText returning text with length > 0', () => {
    cy.get('.tiptap').then(([editorElement]) => {
      (editorElement as EditorElement).editor.commands.focus()
    }).get('.ProseMirror-focused').get('#app')
      .should('not.have.descendants', '[data-tippy-root]')
  })
})
