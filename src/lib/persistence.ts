'use strict';

import { PullRequest } from './types';
import * as fs from 'node:fs/promises';
import * as path from 'path';
import { Repository } from './types';

export class Persistence {
  root: string;

  constructor(root: string) {
    this.root = root;
  }

  async persistPullRequest(pr: PullRequest) {
    const repoDirName = path.join(
      this.root,
      pr.repository.host,
      pr.repository.owner,
      pr.repository.name
    );

    await ensureDirExists(repoDirName);
    await touch(path.join(repoDirName, pr.number.toString()));
  }

  async listPullRequests(): Promise<PullRequest[]> {
    const repositoryPaths: string[] = await recursivelyListDirectory(
      this.root,
      3
    );
    return (
      await Promise.all(repositoryPaths.map(listPullRequestsInRepository))
    ).flat();
  }
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
): Promise<PullRequest[]> {
  console.log(repositoryPath);
  const pullRequests: number[] = (
    await fs.readdir(repositoryPath, { withFileTypes: true })
  )
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .map((name) => parseInt(name))
    .filter((number) => !isNaN(number));

  const pathSegments: string[] = repositoryPath.split(path.sep);
  const repository: Repository = {
    name: pathSegments[pathSegments.length - 1],
    owner: pathSegments[pathSegments.length - 2],
    host: pathSegments[pathSegments.length - 3],
  };
  return pullRequests.map((prNumber) => ({
    repository: repository,
    number: prNumber,
  }));
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