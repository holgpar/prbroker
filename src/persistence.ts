'use strict';

import { PullRequest } from './types';
import { TRACKING_LIST_DIR_NAME } from './constants';
import * as fs from 'node:fs/promises';
import * as path from 'path';

export async function persistPullRequest(pr: PullRequest) {
  const repoDirName = path.join(
    TRACKING_LIST_DIR_NAME,
    pr.repository.host,
    pr.repository.owner,
    pr.repository.name
  );

  await ensureDirExists(repoDirName);
  await touch(path.join(repoDirName, pr.number.toString()));
}

async function ensureDirExists(dirName: string) {
  await fs.mkdir(dirName, { recursive: true }).catch(function (err: Error) {
    if ('code' in err && err.code === 'EEXISTS') {
      // ignore
    } else {
      throw err;
    }
  });
}

async function touch(fileName: string) {
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
