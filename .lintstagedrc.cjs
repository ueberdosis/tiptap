module.exports = files => {
  const filteredFiles = files.filter(file => /\.(ts|tsx|js|jsx|vue)$/.test(file) && !file.includes('/tests_backup/'))

  if (filteredFiles.length === 0) {
    return []
  }

  const fileList = filteredFiles.join(' ')

  return [
    `oxfmt ${fileList}`,
    `oxlint --fix --quiet --no-error-on-unmatched-pattern ${fileList}`,
  ]
}
