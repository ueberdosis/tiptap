// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

function defaults(object, name, value) {
  if (!object) {
    return {
      [name]: value,
    }
  }

  if (object[name] === undefined) {
    return {
      ...object,
      [name]: value,
    }
  }

  return object
}

Cypress.Commands.overwrite('trigger', (originalFn, element, text, options) => {
  if (text === 'keydown') {
    const isMac = Cypress.platform === 'darwin'
    const { modKey, ...rest } = options

    if (modKey) {
      const newOptions = {
        ...defaults(rest, 'force', true),
        ...(isMac ? { metaKey: modKey } : { ctrlKey: modKey }),
      }

      return originalFn(element, text, newOptions)
    }
  }

  return originalFn(element, text, options)
})

Cypress.Commands.overwrite('type', (originalFn, element, text, options) => {
  const newOptions = defaults(options, 'force', true)

  return originalFn(element, text, newOptions)
})

Cypress.Commands.overwrite('click', (originalFn, element, text, options) => {
  const newOptions = defaults(options, 'force', true)

  return originalFn(element, text, newOptions)
})

Cypress.Commands.add(
  'paste',
  { prevSubject: true },
  (subject, pasteOptions) => {
    const { pastePayload, pasteType } = pasteOptions
    const data = pasteType === 'application/json' ? JSON.stringify(pastePayload) : pastePayload
    // https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer
    const clipboardData = new DataTransfer()
    clipboardData.setData(pasteType, data)
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      dataType: pasteType,
      data,
      clipboardData,
    })
    subject[0].dispatchEvent(pasteEvent)

    return subject
  },
)
