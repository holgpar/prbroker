'use strict';

import { Octokit } from 'octokit';
import { Repository, PullRequest } from './types';
import { Persistence } from './persistence';
import { TRACKING_LIST_DIR_NAME } from './constants';

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
    //TODO: proper error handling
    const response = await this._octokit.rest.pulls.get({
      owner: repo.owner,
      repo: repo.name,
      pull_number: pullNumber,
    });
    if ('data' in response) {
      const pr: PullRequest = {
        repository: repo,
        number: response.data.number,
        seen_at: new Date(),
      };
      await new Persistence(TRACKING_LIST_DIR_NAME).persistPullRequest(pr);
    }
  }
}
