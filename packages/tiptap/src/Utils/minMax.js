export default function minMax(value = 0, min = 0, max = 0) {
  return Math.min(Math.max(parseInt(value, 10), min), max)
}
