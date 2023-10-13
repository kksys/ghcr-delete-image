import * as core from '@actions/core'
import { getOctokit } from '@actions/github'
import { getConfig } from './utils'
import { deleteUntaggedOrderGreaterThan } from './actions'

async function run(): Promise<void> {
  try {
    const config = getConfig()
    const octokit = getOctokit(config.token)

    core.info(`user: ${config.user}`)
    core.info(`name: ${config.name}`)
    core.info(`token: ${config.token}`)
    core.info(`untagged-keep-latest: ${config.untaggedKeepLatest}`)

    if (config.untaggedKeepLatest) {
      core.info('untagged-keep-latest is selected')
      // debug
      const response = await octokit.rest.packages.listPackagesForUser({
        package_type: 'container',
        username: config.user,
      })
      core.info(JSON.stringify(response.data))

      await deleteUntaggedOrderGreaterThan(config, octokit);
    }
  } catch (error) {
    if (error instanceof Error)
      core.setFailed(error.message)
  }
}

run()
