'use strict';

import child_process from 'node:child_process';
import { platform } from 'node:process';
import * as pr from './pullRequests';
import GitUrlParse from 'git-url-parse';

const GIT = platform === 'win32' ? 'git.exe' : 'git';

export function getRepository() {
  const originUrl: string = child_process.execFileSync(
    GIT,
    ['remote', 'get-url', 'origin'],
    { encoding: 'utf8' }
  );
  return parseRepositoryUrl(originUrl.trimEnd());
}

function parseRepositoryUrl(url: string): pr.Repository {
  const parsed = GitUrlParse(url);

  return {
    host: parsed.resource,
    owner: parsed.owner,
    name: parsed.name,
  };
}
