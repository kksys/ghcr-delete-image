import * as core from '@actions/core'
import { getOctokit } from '@actions/github'
import { differenceInMilliseconds } from 'date-fns'

export interface Config {
  user: string
  name: string
  token: string

  untaggedKeepLatest?: number | undefined
}

export function getConfig(): Config {
  const rawData = {
    user: core.getInput('user', { required: true }),
    name: core.getInput('name', { required: true }),
    token: core.getInput('token', { required: true }),
    untaggedKeepLatest: core.getInput("untagged-keep-latest") || undefined,
  }
  const config: Config = {
    user: rawData.user,
    name: rawData.name,
    token: rawData.token,
  }

  if (rawData.untaggedKeepLatest) {
    const parsedToNumber = parseInt(rawData.untaggedKeepLatest)
    if (isNaN(parsedToNumber)) {
      throw new TypeError('untagged-keep-latest is not number')
    } else {
      config.untaggedKeepLatest = parsedToNumber
    }
  }

  return config
}

export const findPackageVersionsUntaggedOrderGreaterThan = async function (
  octokit: ReturnType<typeof getOctokit>,
  user: string,
  name: string,
  n?: number | undefined
) {
  const pkgs = [];

  for await (const pkgVer of iteratePackageVersions(octokit, user, name)) {
    const versionTags = pkgVer.metadata?.container?.tags;
    if (versionTags?.length == 0) {
      pkgs.push(pkgVer);
    }
  }

  pkgs.sort((a, b) => {
    return differenceInMilliseconds(new Date(b.updated_at), new Date(a.updated_at));
  });

  return pkgs.slice(n);
};

export const iteratePackageVersions = async function* (
  octokit: ReturnType<typeof getOctokit>,
  user: string,
  name: string
) {
  for await (const response of octokit.paginate.iterator(
    octokit.rest.packages.getAllPackageVersionsForPackageOwnedByUser,
    {
      package_type: "container",
      package_name: name,
      username: user,
    }
  )) {
    for (let packageVersion of response.data) {
      yield packageVersion;
    }
  }
}

export const deletePackageVersion = async (
  octokit: ReturnType<typeof getOctokit>,
  user: string,
  name: string,
  versionId: number
) => {
  await octokit.rest.packages.deletePackageVersionForUser({
    package_type: "container",
    package_name: name,
    username: user,
    package_version_id: versionId,
  });
};