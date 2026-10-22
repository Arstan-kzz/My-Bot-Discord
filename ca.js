'use strict';

const path = require('node:path');

const ROOT_DIR = __dirname;

const PATHS = Object.freeze({
  root: ROOT_DIR,
  loud: path.join(ROOT_DIR, 'loud'),
  commandManager: path.join(ROOT_DIR, 'loud', 'm-c.js'),
  automationManager: path.join(ROOT_DIR, 'loud', 'm-a.js'),
  event: path.join(ROOT_DIR, 'event'),
  games: path.join(ROOT_DIR, 'games'),
  voice: path.join(ROOT_DIR, 'voice'),
  configID: path.join(ROOT_DIR, 'configID'),
});

let initialized = false;

function getPaths() {
  return PATHS;
}

async function init() {
  if (initialized) {
    throw new Error('ca.js sudah diinisialisasi.');
  }

  initialized = true;

  console.log('[CA] Core berhasil diinisialisasi.');

  return {
    paths: getPaths(),
  };
}

module.exports = {
  init,
  getPaths,
};