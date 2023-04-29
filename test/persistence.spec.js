'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_os_1 = require("node:os");
const persistence_1 = require("../src/lib/persistence");
const chai_1 = require("chai");
describe('reading from directory structure', function () {
    let tempRoot;
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            tempRoot = yield (0, promises_1.mkdtemp)((0, node_path_1.join)((0, node_os_1.tmpdir)(), 'mocha-test'));
        });
    });
    afterEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, promises_1.rm)(tempRoot, { recursive: true, force: true });
        });
    });
    describe('find one pull request', function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const project = (0, node_path_1.join)(tempRoot, 'github.foo.bar', 'msyself', 'project');
                yield (0, persistence_1.ensureDirExists)(project);
                yield (0, persistence_1.touch)((0, node_path_1.join)(project, '1'));
            });
        });
        it('test', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const examinee = new persistence_1.Persistence(tempRoot);
                const actual = yield examinee.listPullRequests();
                (0, chai_1.expect)(actual).to.have.length(1);
            });
        });
    });
});
