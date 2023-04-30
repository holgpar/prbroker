'use strict';

import { Octokit } from 'octokit';
import { Repository, PullRequestCoordinates } from './types';
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
      const pr: PullRequestCoordinates = {
        repository: repo,
        number: response.data.number,
      };
      await new Persistence(TRACKING_LIST_DIR_NAME).persistPullRequest(pr);
    }
  }
}
