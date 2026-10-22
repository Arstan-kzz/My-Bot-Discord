'use strict';

const path = require('node:path');

const SCANNERS = Object.freeze([
  path.resolve(__dirname, '..', 'event', 'scr.js'),
  path.resolve(__dirname, '..', 'games', 'scr.js'),
  path.resolve(__dirname, '..', 'voice', 'scr.js'),
]);

class AutomationManager {
  constructor() {
    this.modules = new Map();
    this.initialized = false;
    this.scanning = false;
  }

  init() {
    if (this.initialized) {
      throw new Error('[M-A] Manager sudah diinisialisasi.');
    }

    this.initialized = true;

    console.log('[M-A] Automation manager siap.');

    return this;
  }

  async scan() {
    if (!this.initialized) {
      throw new Error(
        '[M-A] Panggil init() sebelum melakukan pemindaian.'
      );
    }

    if (this.scanning) {
      throw new Error('[M-A] Pemindaian sedang berlangsung.');
    }

    this.scanning = true;

    try {
      const discoveredFiles = [];

      for (const scannerPath of SCANNERS) {
        let scanner;

        try {
          scanner = require(scannerPath);
        } catch (error) {
          throw new Error(
            `[M-A] Gagal memuat scanner ${scannerPath}: ${error.message}`,
            { cause: error }
          );
        }

        if (typeof scanner.scan !== 'function') {
          throw new TypeError(
            `[M-A] Scanner ${scannerPath} harus mengekspor scan().`
          );
        }

        const files = await scanner.scan();

        if (!Array.isArray(files)) {
          throw new TypeError(
            `[M-A] Hasil scanner ${scannerPath} harus berupa array.`
          );
        }

        discoveredFiles.push(...files);
      }

      const uniqueFiles = [...new Set(discoveredFiles)].sort();

      console.log(
        `[M-A] Pemindaian selesai. ${uniqueFiles.length} file ditemukan.`
      );

      return uniqueFiles;
    } finally {
      this.scanning = false;
    }
  }

  register(modulePath, moduleDefinition) {
    if (typeof modulePath !== 'string' || !modulePath.trim()) {
      throw new TypeError('[M-A] Path modul tidak valid.');
    }

    if (!moduleDefinition || typeof moduleDefinition !== 'object') {
      throw new TypeError('[M-A] Definisi modul harus berupa object.');
    }

    const resolvedPath = path.resolve(modulePath);

    if (this.modules.has(resolvedPath)) {
      throw new Error(
        `[M-A] Modul sudah terdaftar: ${resolvedPath}`
      );
    }

    this.modules.set(resolvedPath, moduleDefinition);

    console.log(`[M-A] Modul terdaftar: ${resolvedPath}`);

    return moduleDefinition;
  }

  getAll() {
    return [...this.modules.entries()].map(
      ([modulePath, definition]) => ({
        path: modulePath,
        definition,
      })
    );
  }

  get size() {
    return this.modules.size;
  }

  destroy() {
    this.modules.clear();
    this.initialized = false;
    this.scanning = false;

    console.log('[M-A] Automation manager dihentikan.');
  }
}

module.exports = new AutomationManager();