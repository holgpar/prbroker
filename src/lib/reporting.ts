'use strict';

import * as pr from './pullRequests';

export class Reporter {
  recentlyUpdated(pullRequest: pr.Data) {
    return pullRequest.seen_at < new Date(pullRequest.apiData.updated_at);
  }

  compileReport(pullRequests: pr.Data[]): pr.Data[] {
    return pullRequests.filter(this.recentlyUpdated);
  }

  printReport(pullRequests: pr.Data[]): void {
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
