import * as core from '@actions/core'
import { getOctokit } from '@actions/github'
import { getConfig } from './utils'
import { deleteUntaggedOrderGreaterThan } from './actions'

export const iteratePackages = async function* (
  octokit: ReturnType<typeof getOctokit>,
  user: string
) {
  for await (const response of octokit.paginate.iterator(
    octokit.rest.packages.listPackagesForUser,
    {
      package_type: 'container',
      username: user,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )) {
    for (let packageVersion of response.data) {
      yield packageVersion;
    }
  }
}

async function run(): Promise<void> {
  try {
    const config = getConfig()
    const octokit = getOctokit(config.token)
    octokit.log.info = core.info
    octokit.log.error = core.error
    octokit.log.warn = core.warning
    octokit.log.debug = core.debug

    core.info(`user: ${config.user}`)
    core.info(`name: ${config.name}`)
    core.info(`token: ${config.token}`)
    core.info(`untagged-keep-latest: ${config.untaggedKeepLatest}`)

    if (config.untaggedKeepLatest) {
      core.info('untagged-keep-latest is selected')
      // debug
      for await (const pkgs of iteratePackages(octokit, config.user)) {
        core.info(JSON.stringify(pkgs))
      }

      await deleteUntaggedOrderGreaterThan(config, octokit);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.info(JSON.stringify(error, undefined, 2))
      core.setFailed(error)
    }
  }
}

run()
