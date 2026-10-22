'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT_DIR = __dirname;
const SELF_PATH = path.resolve(__filename);

async function scanDirectory(directory, results) {
  const entries = await fs.readdir(directory, {
    withFileTypes: true,
  });

  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = path.resolve(directory, entry.name);

    if (entry.isDirectory()) {
      await scanDirectory(fullPath, results);
      continue;
    }

    if (
      entry.isFile() &&
      entry.name.endsWith('.js') &&
      fullPath !== SELF_PATH
    ) {
      results.push(fullPath);
    }
  }
}

async function scan() {
  const results = [];

  await scanDirectory(ROOT_DIR, results);

  return results.sort();
}

module.exports = {
  scan,
};