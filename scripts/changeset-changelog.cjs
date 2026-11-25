const { default: defaultChangelog } = require('@changesets/cli/changelog')

module.exports = {
  getReleaseLine: defaultChangelog.getReleaseLine,
  // Fixed versioning bumps every package, so dependency lines are only noise
  getDependencyReleaseLine: async () => '',
}
