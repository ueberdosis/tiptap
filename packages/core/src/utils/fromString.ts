export default function fromString(value: any) {
  if (value.match(/^\d*(\.\d+)?$/)) {
    return Number(value)
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return value
}
