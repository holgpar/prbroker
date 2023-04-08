'use strict';

import { Octokit } from 'octokit';
import { Repository, PullRequest } from '../types';
import { persistPullRequest } from '../persistence';

export class Tracker {
  _octokit: Octokit;

  constructor(octokit: Octokit) {
    this._octokit = octokit;
  }

  async addNewPr(repo: Repository, prIdentifier: string) {
    const pullNumber = Number(prIdentifier);
    if (isNaN(pullNumber)) {
      throw new Error('PR identifier must be a number');
    }
    const response = await this._octokit.rest.pulls.get({
      owner: repo.owner,
      repo: repo.name,
      pull_number: pullNumber,
    });
    if ('data' in response) {
      const pr: PullRequest = {
        repository: repo,
        number: response.data.number,
      };
      await persistPullRequest(pr);
    }
  }
}
