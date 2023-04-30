'use strict';

import { PullRequestFetcher } from './github';
import { Persistence } from './persistence';
import { PullRequest, PullRequestData } from './types';

export class Reporter {
  recentlyUpdated(pullRequest: PullRequest & PullRequestData) {
    return pullRequest.seen_at < new Date(pullRequest.updated_at);
  }

  compileReport(
    pullRequests: (PullRequest & PullRequestData)[]
  ): (PullRequest & PullRequestData)[] {
    return pullRequests.filter(this.recentlyUpdated);
  }

  printReport(pullRequests: (PullRequest & PullRequestData)[]): void {
    const table = pullRequests.map((pr) => ({
      URL: pr.url,
      'updated at': pr.updated_at,
    }));
    console.table(table);
  }
}
