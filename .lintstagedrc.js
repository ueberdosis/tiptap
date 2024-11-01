module.exports = {
  './**/*.{ts,tsx,js,jsx,vue}': ['prettier --write', 'eslint --fix --quiet --no-error-on-unmatched-pattern'],
}
