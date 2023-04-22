'use strict';

export type Repository = {
  host: string;
  owner: string;
  name: string;
};

export type PullRequest = {
  repository: Repository;
  number: number;
};
