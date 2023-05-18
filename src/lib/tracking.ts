'use strict';

import * as pr from './pullRequests';
import { Persistence } from './persistence';
import { TRACKING_LIST_DIR_NAME } from './constants';
import { getRepository } from './gitContext';

export class Tracker {
  _persistence: Persistence;

  constructor(persistence: Persistence) {
    this._persistence = persistence;
  }

  private static throwUrlParseError(url: string) {
    throw new Error(`'${url}' does not look like a pull request URL`);
  }

  async addNewPr(prIdentifier: string) {
    const pullRequest = await this.parseIdentifier(prIdentifier);
    await new Persistence(TRACKING_LIST_DIR_NAME).persistPullRequest(
      pullRequest
    );
  }

  async parseIdentifier(prIdentifier: string): Promise<pr.Coordinates> {
    const pullRequestNumber = parseInt(prIdentifier);

    if (!isNaN(pullRequestNumber)) {
      const repo = getRepository();
      //TODO: proper error handling
      return {
        repository: repo,
        number: pullRequestNumber,
      };
    } else {
      const pullRequestUrl = new URL(prIdentifier);
      const pathSegments = pullRequestUrl.pathname.split('/');
      if (pathSegments.length !== 5 || pathSegments[3] !== 'pull') {
        Tracker.throwUrlParseError(prIdentifier);
      }
      const repository: pr.Repository = {
        host: pullRequestUrl.host,
        owner: pathSegments[1],
        name: pathSegments[2],
      };
      const pullRequestNumber = parseInt(pathSegments[4]);
      return {
        repository: repository,
        number: pullRequestNumber,
      };
    }
  }
}
