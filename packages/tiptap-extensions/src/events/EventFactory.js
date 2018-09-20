import align from './align.js'

const events = {
  align
}

export default function self (...test) {
  return test.reduce(function (o, i) {
    if (typeof i === 'string') o[i] = this[i]
    return o
  }.bind(events), {})
}
