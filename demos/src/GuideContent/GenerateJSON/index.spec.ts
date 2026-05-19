import { expect, test } from '@playwright/test'

const demoName = 'GenerateJSON'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/GuideContent'

const expectedJSON = `{
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
}`

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('renders the content as a JSON string', async ({ page }) => {
        await expect(page.locator('pre code')).toContainText(expectedJSON)
      })
    })
  })
})
