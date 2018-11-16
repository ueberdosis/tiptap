import ora from 'ora'
import webpack from 'webpack'
import config from './webpack.config'

const spinner = ora('Building …')

export default new Promise((resolve, reject) => {
  spinner.start()

  webpack(config, (error, stats) => {
    if (error) {
      return reject(error)
    }

    if (stats.hasErrors()) {
      process.stdout.write(stats.toString() + "\n");
      return reject(new Error('Build failed with errors.'))
    }

    return resolve('Build complete.')
  })
})
.then(success => spinner.succeed(success))
.catch(error => spinner.fail(error))
