'use strict';

export type Repository = {
  host: string;
  owner: string;
  name: string;
};

export type PullRequestCoordinates = {
  repository: Repository;
  number: number;
};

export type PullRequestTrackingInfo = PullRequestCoordinates & {
  seen_at: Date;
  index: number;
};

export interface PullRequestAPIData {
  html_url: string;
  updated_at: string;
  title: string;
}

export type PullRequestData = PullRequestTrackingInfo & {
  apiData: PullRequestAPIData;
};
