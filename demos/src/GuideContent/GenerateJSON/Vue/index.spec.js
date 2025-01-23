context('/src/GuideContent/GenerateJSON/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/GuideContent/GenerateJSON/Vue/')
  })

  it('should render the content as an HTML string', () => {
    cy.get('pre code').should('exist')

    cy.get('pre code').should(
      'contain',
      `{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Example "
        },
        {
          "type": "text",
          "marks": [
            {
              "type": "bold"
            }
          ],
          "text": "Text"
        }
      ]
    }
  ]
}`,
    )
  })
})
