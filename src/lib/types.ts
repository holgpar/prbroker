'use strict';

export type Repository = {
  host: string;
  owner: string;
  name: string;
};

export type PullRequest = {
  repository: Repository;
  number: number;
  seen_at: Date;
};

export interface PullRequestData {
  url: string;
  updated_at: string;
}
