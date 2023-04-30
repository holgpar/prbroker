'use strict';

import { PullRequestData } from './types';

export class Reporter {
  recentlyUpdated(pullRequest: PullRequestData) {
    return pullRequest.seen_at < new Date(pullRequest.apiData.updated_at);
  }

  compileReport(pullRequests: PullRequestData[]): PullRequestData[] {
    return pullRequests.filter(this.recentlyUpdated);
  }

  printReport(pullRequests: PullRequestData[]): void {
    const table = pullRequests.reduce(
      (table, pr) => ({
        ...table,
        [pr.index]: {
          Title: pr.apiData.title,
          'Updated at': pr.apiData.updated_at,
        },
      }),
      {}
    );
    console.table(table);
  }
}
