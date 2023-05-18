'use strict';

import * as pr from './pullRequests';
import sprintf from 'sprintf-js';

export class Reporter {
  recentlyUpdated(pullRequest: pr.Data) {
    return pullRequest.seen_at < new Date(pullRequest.apiData.updated_at);
  }

  compileReport(pullRequests: pr.Data[]): pr.Data[] {
    return pullRequests.filter(this.recentlyUpdated);
  }

  printReport(pullRequests: pr.Data[]): void {
    const headerFormat = "%2d : #%'#5d %s @ %s";
    const row___Format = '%2s |  %5s %s';
    for (const pull of pullRequests) {
      const user: string = pull.apiData.user?.login || 'unknown';
      console.log(
        sprintf.sprintf(
          headerFormat,
          pull.index,
          pull.number,
          pull.apiData.title,
          user
        )
      );
      console.log(sprintf.sprintf(row___Format, '', '', pull.apiData.html_url));
      if (pull.apiData.user) {
        console.log(
          sprintf.sprintf(row___Format, '', '', pull.apiData.user.login)
        );
      }
      console.log('');
    }
  }
}
