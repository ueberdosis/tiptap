export default function minMax(value:number = 0, min:number = 0, max:number = 0): number {
  return Math.min(Math.max(value, min), max)
}