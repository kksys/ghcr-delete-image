import * as core from '@actions/core'
import { getOctokit } from '@actions/github'
import { getConfig } from './utils'
import { deleteUntaggedOrderGreaterThan } from './actions'

async function run(): Promise<void> {
  try {
    const config = getConfig()
    const octokit = getOctokit(config.token)

    if (config.untaggedKeepLatest) {
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
