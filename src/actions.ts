import * as core from '@actions/core'
import { getOctokit } from '@actions/github'
import { Config, deletePackageVersion, findPackageVersionsUntaggedOrderGreaterThan } from './utils'

export async function deleteUntaggedOrderGreaterThan(
  config: Config,
  octokit: ReturnType<typeof getOctokit>
) {
  core.info(`🔎 find not latest ${config.untaggedKeepLatest} packages...`);

  const pkgs = await findPackageVersionsUntaggedOrderGreaterThan(
    octokit,
    config.user,
    config.name,
    config.untaggedKeepLatest
  );

  core.startGroup(`🗑 delete ${pkgs.length} packages`);

  for (const pkg of pkgs) {
    try {
      await deletePackageVersion(
        octokit,
        config.user,
        config.name,
        pkg.id
      );
    } catch (error) {
      if (error instanceof Error)
        core.info(`⚠️ package #${pkg.id} not deleted: ${error.message}`);
      continue;
    }


    core.info(`✅ package #${pkg.id} deleted.`);
  }

  core.endGroup();
}