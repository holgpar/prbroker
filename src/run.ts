'use strict';

import * as path from 'path';
import * as fs from 'node:fs';
import { Command } from 'commander';

// own modules
import { getRepository } from './lib/gitContext';
import { Tracker } from './lib/tracking';
import { Persistence } from './lib/persistence';
import { TRACKING_LIST_DIR_NAME } from './lib/constants';
import * as github from './lib/github';
import { Reporter } from './lib/reporting';

function readConfig() {
  const home: string = process.env.HOME as string;
  const configFileName = path.join(home, '.github_bot.json');
  const json = fs.readFileSync(configFileName, { encoding: 'utf8' });
  return JSON.parse(json);
}

const config = readConfig();

const pkg = require('../../package.json');
const appName = Object.keys(pkg.bin)[0];

const program = new Command();
program
  .description(pkg.description)
  .name(appName)
  .option('-c, --config <path>', 'set path to configuration file')
  .version(pkg.version);

program
  .command('track')
  .description('keep track of a pull request')
  .argument('<prIdentifier>', 'Pull request number or branch name')
  .action(async function (prIdentifier) {
    console.log('tracking ', prIdentifier);
    const repo = getRepository();
    const client = github.getClientForHost(config, repo.host);
    const tracker = new Tracker(client);
    await tracker.addNewPr(repo, prIdentifier);
  });

program
  .command('report')
  .description('report on tracked pull requests')
  .action(async function () {
    const pullRequests = await new Persistence(
      TRACKING_LIST_DIR_NAME
    ).listPullRequests();
    const fetcher = new github.PullRequestFetcher(config);
    const data = await fetcher.fetchPullRequests(pullRequests);
    const reporter = new Reporter();
    const report = reporter.compileReport(data);
    reporter.printReport(report);
  });

program.parseAsync();
