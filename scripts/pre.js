const { execSync } = require('child_process')

// get the branch name from the abbreviated reference
const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()

switch (branch) {
  case 'main':
    console.log('You are on the main branch, exiting pre tag')
    execSync('npx changeset pre exit', { stdio: 'inherit' })
    break

  case 'develop':
    console.log('You are on the develop branch, entering pre tags')
    execSync('npx changeset pre enter pre', { stdio: 'inherit' })
    break

  case 'next':
    console.log('You are on the next branch, entering next tags')
    execSync('npx changeset pre enter next', { stdio: 'inherit' })
    break

  default:
    break
}
