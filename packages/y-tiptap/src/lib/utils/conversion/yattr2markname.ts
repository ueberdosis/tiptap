const hashedMarkNameRegex = /(.*)(--[a-zA-Z0-9+/=]{8})$/
export const yattr2markname = (attrName: string) =>
  hashedMarkNameRegex.exec(attrName)?.[1] ?? attrName
