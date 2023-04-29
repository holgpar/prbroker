'use strict';

import { Octokit } from 'octokit';
import { PullRequest, PullRequestData } from './types';

export function getClientForHost(config: any, host: string): Octokit {
  const server = config.servers.find((server: any) => server.host === host);
  if (!server) {
    throw new Error(`Cannot find configuration for host ${host}.`);
  }
  if ('token' in server) {
    return new Octokit({ auth: server.token, baseUrl: server.baseUrl });
  } else {
    throw new Error(`No token found in configuration for host ${host}.`);
  }
}

class ClientCache {
  config: any;
  content: { [id: string]: Octokit } = {};

  constructor(config: any) {
    this.config = config;
  }

  load(key: string): Octokit {
    let client = this.content[key];
    if (!client) {
      client = getClientForHost(this.config, key);
      this.content['key'] = client;
    }
    return client;
  }
}

export class PullRequestFetcher {
  config: any;
  cache: ClientCache;

  constructor(config: any) {
    this.config = config;
    this.cache = new ClientCache(config);
  }

  async fetchPullRequests(
    pullRequests: PullRequest[]
  ): Promise<PullRequestData[]> {
    const responses = await Promise.all(
      pullRequests.map((pr) => {
        const client = this.cache.load(pr.repository.host);
        return client.rest.pulls.get({
          owner: pr.repository.owner,
          repo: pr.repository.name,
          pull_number: pr.number,
        });
      })
    );
    return responses.map((r) => r.data);
  }
}
