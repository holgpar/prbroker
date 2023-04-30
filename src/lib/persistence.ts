'use strict';

import * as pr from './pullRequests';
import * as fs from 'node:fs/promises';
import * as path from 'path';

export class Persistence {
  root: string;

  constructor(root: string) {
    this.root = root;
  }

  async persistPullRequest(pr: pr.Coordinates) {
    const repoDirName = path.join(
      this.root,
      pr.repository.host,
      pr.repository.owner,
      pr.repository.name
    );

    await ensureDirExists(repoDirName);
    await touch(path.join(repoDirName, pr.number.toString()));
  }

  async listPullRequests(): Promise<pr.TrackingInfo[]> {
    const repositoryPaths: string[] = await recursivelyListDirectory(
      this.root,
      3
    );
    const result = (
      await Promise.all(repositoryPaths.map(listPullRequestsInRepository))
    ).flat();
    result.sort(comparePullRequests);
    for (let index = 0; index < result.length; index++) {
      result[index].index = index + 1;
    }
    return result;
  }
}

function comparePullRequests(
  left: pr.TrackingInfo,
  right: pr.TrackingInfo
): number {
  return left.seen_at.getMilliseconds() - right.seen_at.getMilliseconds();
}

async function recursivelyListDirectory(
  root: string,
  levels: number
): Promise<string[]> {
  const subDirectories: string[] = (
    await fs.readdir(root, { withFileTypes: true })
  )
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .map((name) => path.join(root, name));

  if (levels <= 1) {
    return subDirectories;
  }
  levels--;
  return (
    await Promise.all(
      subDirectories.map((directory) =>
        recursivelyListDirectory(directory, levels)
      )
    )
  ).flat();
}

async function listPullRequestsInRepository(
  repositoryPath: string
): Promise<pr.TrackingInfo[]> {
  const pullRequestNumbers: number[] = (
    await fs.readdir(repositoryPath, { withFileTypes: true })
  )
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .map((name) => parseInt(name))
    .filter((number) => !isNaN(number));

  const pathSegments: string[] = repositoryPath.split(path.sep);
  const repository: pr.Repository = {
    name: pathSegments[pathSegments.length - 1],
    owner: pathSegments[pathSegments.length - 2],
    host: pathSegments[pathSegments.length - 3],
  };
  return Promise.all(
    pullRequestNumbers.map(async (pr) => ({
      repository: repository,
      number: pr,
      seen_at: (await fs.stat(path.join(repositoryPath, pr.toString()))).mtime,
      index: NaN,
    }))
  );
}

export async function ensureDirExists(dirName: string) {
  await fs.mkdir(dirName, { recursive: true }).catch(function (err: Error) {
    if ('code' in err && err.code === 'EEXISTS') {
      // ignore
    } else {
      throw err;
    }
  });
}

export async function touch(fileName: string) {
  const time = new Date();

  await fs.utimes(fileName, time, time).catch(async function (err: Error) {
    if ('code' in err && err.code === 'ENOENT') {
      let fh = await fs.open(fileName, 'a');
      await fh.close();
    } else {
      throw err;
    }
  });
}
