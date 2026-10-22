'use strict';

const path = require('node:path');

const SCANNERS = Object.freeze([
  path.resolve(__dirname, '..', 'event', 'scr.js'),
  path.resolve(__dirname, '..', 'games', 'scr.js'),
  path.resolve(__dirname, '..', 'voice', 'scr.js'),
]);

class CommandManager {
  constructor() {
    this.commands = new Map();
    this.initialized = false;
  }

  init() {
    if (this.initialized) {
      throw new Error('[M-C] Manager sudah diinisialisasi.');
    }

    this.initialized = true;
    console.log('[M-C] Command manager siap.');

    return this;
  }

  async scan() {
    const discoveredFiles = [];

    for (const scannerPath of SCANNERS) {
      let scanner;

      try {
        scanner = require(scannerPath);
      } catch (error) {
        throw new Error(
          `[M-C] Gagal memuat scanner ${scannerPath}: ${error.message}`,
          { cause: error }
        );
      }

      if (typeof scanner.scan !== 'function') {
        throw new TypeError(
          `[M-C] Scanner ${scannerPath} harus mengekspor fungsi scan().`
        );
      }

      let files;

      try {
        files = await scanner.scan();
      } catch (error) {
        throw new Error(
          `[M-C] Scanner gagal: ${scannerPath}: ${error.message}`,
          { cause: error }
        );
      }

      if (!Array.isArray(files)) {
        throw new TypeError(
          `[M-C] Scanner ${scannerPath} harus mengembalikan array.`
        );
      }

      discoveredFiles.push(...files);
    }

    const uniqueFiles = [...new Set(discoveredFiles)].sort();

    console.log(
      `[M-C] Pemindaian selesai. ${uniqueFiles.length} file ditemukan.`
    );

    return uniqueFiles;
  }

  register(command) {
    if (!command || typeof command !== 'object') {
      throw new TypeError('[M-C] Command harus berupa object.');
    }

    if (
      typeof command.name !== 'string' ||
      !command.name.trim()
    ) {
      throw new TypeError('[M-C] Nama command tidak valid.');
    }

    const name = command.name.trim().toLowerCase();

    if (this.commands.has(name)) {
      throw new Error(`[M-C] Command "${name}" sudah terdaftar.`);
    }

    this.commands.set(name, command);

    console.log(`[M-C] Command terdaftar: ${name}`);

    return command;
  }

  get(name) {
    if (typeof name !== 'string') {
      return undefined;
    }

    return this.commands.get(name.trim().toLowerCase());
  }

  getAll() {
    return [...this.commands.values()];
  }

  unregister(name) {
    if (typeof name !== 'string') {
      return false;
    }

    return this.commands.delete(name.trim().toLowerCase());
  }

  get size() {
    return this.commands.size;
  }

  destroy() {
    this.commands.clear();
    this.initialized = false;

    console.log('[M-C] Command manager dihentikan.');
  }
}

module.exports = new CommandManager();