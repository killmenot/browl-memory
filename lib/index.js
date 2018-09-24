'use strict';

const browlUtil = require('browl-util');
const debug = require('debug')('browl-memory');

class MemoryDb {
  constructor(options) {
    debug('init: %j', options);

    this.storage = {};
  }

  getStorage() {
    debug('getStorage');

    return this.storage;
  }

  setStorage(data) {
    debug('setStorage: %j', data);
    this.storage = data;
  }

  add(repo, branch, callback) {
    debug('add: repo = %s, branch = %s', repo, branch);

    let promise;

    if (!callback) {
      promise = new Promise((resolve, reject) => callback = browlUtil.callbackPromise(resolve, reject));
    }

    const branches = this.storage[repo] || [];

    branches.push(branch);
    this.storage[repo] = branches;

    callback(null);

    return promise;
  }

  remove(repo, branch, callback) {
    debug('remove: repo = %s, branch = %s', repo, branch);

    let promise;

    if (!callback) {
      promise = new Promise((resolve, reject) => callback = browlUtil.callbackPromise(resolve, reject));
    }

    this.storage[repo] = (this.storage[repo] || []).filter(x => x !== branch);

    if (Object.keys(this.storage[repo]).length === 0) {
      delete this.storage[repo];
    }

    callback(null);

    return promise;
  }

  /**
   * @deprecated
   */
  list() {
    debug('list');

    return Object.keys(this.storage).length > 0 ?
      JSON.stringify(this.storage, null, 2) :
      'No configured instances.';
  }

  exists(...args) {
    const [repo, branch] = args;

    debug('exists: repo = %s, branch = %s', repo, branch);

    if (args.length === 2) {
      return (this.storage[repo] || []).includes(branch);
    }

    if (args.length === 1) {
      return repo in this.storage;
    }

    throw Error('invalid parameters.');
  }

  branches(repo) {
    debug('branches: %s', repo);

    return this.storage[repo] || [];
  }

  instances(repo) {
    debug('instances: %s', repo);

    const repos = repo ? [repo] : Object.keys(this.storage);
    const reducer = (instances, repo) => {
      return instances.concat(this.storage[repo].map(x =>
        ({
          branch: x,
          repo: repo
        }))
      );
    };

    return repos.reduce(reducer, []);
  }
}

module.exports = MemoryDb;
