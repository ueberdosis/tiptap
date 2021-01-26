export default function createCell(cellType, cellContent) {
  if (cellContent) {
    return cellType.createChecked(null, cellContent)
  }

  return cellType.createAndFill()
}
