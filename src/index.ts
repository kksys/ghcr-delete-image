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
      for await (const response of octokit.paginate.iterator(
        octokit.rest.packages.listPackagesForUser,
        {
          username: config.user,
          package_type: 'container',
          per_page: 1000
        }
      )) {
        core.info(JSON.stringify(response.data))
      }

      await deleteUntaggedOrderGreaterThan(config, octokit);
    }
  } catch (error) {
    if (error instanceof Error)
      core.setFailed(error.message)
  }
}

run()
