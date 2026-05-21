module.exports = files => {
  const filteredFiles = files.filter(file => /\.(ts|tsx|js|jsx|vue)$/.test(file) && !file.includes('/tests_backup/'))

  if (filteredFiles.length === 0) {
    return []
  }

  const fileList = filteredFiles.join(' ')

  return [
    `prettier --write ${fileList}`,
    `eslint --fix --quiet --no-error-on-unmatched-pattern ${fileList}`,
  ]
}
