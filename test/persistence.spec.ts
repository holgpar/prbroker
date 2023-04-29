'use strict';

import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ensureDirExists, touch, Persistence } from '../src/lib/persistence';
import { expect } from 'chai';

describe('reading from directory structure', function () {
  let tempRoot: string;
  beforeEach(async function () {
    tempRoot = await mkdtemp(join(tmpdir(), 'mocha-test'));
  });
  afterEach(async function () {
    await rm(tempRoot, { recursive: true, force: true });
  });
  describe('find one pull request', function () {
    beforeEach(async function () {
      const project = join(tempRoot, 'github.foo.bar', 'msyself', 'project');
      await ensureDirExists(project);
      await touch(join(project, '1'));
    });
    it('test', async function () {
      const examinee = new Persistence(tempRoot);
      const actual = await examinee.listPullRequests();
      expect(actual).to.have.length(1);
    });
  });
});
