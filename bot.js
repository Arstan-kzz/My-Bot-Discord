'use strict';

const {
  Client,
  GatewayIntentBits,
  Events,
} = require('discord.js');

const core = require('./ca.js');

const TOKEN = process.env.DISCORD_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
});

let isStarting = false;
let isShuttingDown = false;

client.once(Events.ClientReady, (readyClient) => {
  console.log('========================================');
  console.log('          DISCORD BOT ONLINE             ');
  console.log('========================================');
  console.log(`Nama   : ${readyClient.user.tag}`);
  console.log(`ID     : ${readyClient.user.id}`);
  console.log(`Status : Ready`);
  console.log('========================================');
});

client.on(Events.Error, (error) => {
  console.error('[DISCORD] Client error:', error);
});

client.on(Events.ShardDisconnect, (event, shardId) => {
  console.warn(
    `[DISCORD] Shard ${shardId} terputus. Code: ${event.code}`
  );
});

client.on(Events.ShardReconnecting, (shardId) => {
  console.log(`[DISCORD] Shard ${shardId} mencoba terhubung kembali.`);
});

client.on(Events.ShardResume, (shardId, replayedEvents) => {
  console.log(
    `[DISCORD] Shard ${shardId} tersambung kembali. ` +
    `Event diputar ulang: ${replayedEvents}`
  );
});

async function startBot() {
  if (isStarting || isShuttingDown) {
    return;
  }

  isStarting = true;

  try {
    if (!TOKEN || !TOKEN.trim()) {
      throw new Error(
        'Environment variable DISCORD_TOKEN belum diatur.'
      );
    }

    console.log('[BOT] Memulai inisialisasi...');
    console.log('[BOT] Memuat core...');

    await core.init();

    console.log('[BOT] Core berhasil diinisialisasi.');
    console.log('[BOT] Menghubungkan ke Discord...');

    await client.login(TOKEN);
  } catch (error) {
    console.error('[BOT] Gagal menjalankan bot:', error.message);
    process.exitCode = 1;

    client.destroy();
  } finally {
    isStarting = false;
  }
}

async function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`\n[BOT] Menerima ${signal}. Mematikan bot...`);

  try {
    client.destroy();
    console.log('[BOT] Koneksi Discord ditutup.');
  } catch (error) {
    console.error('[BOT] Terjadi kesalahan saat shutdown:', error);
    process.exitCode = 1;
  }
}

process.once('SIGINT', () => {
  void shutdown('SIGINT');
});

process.once('SIGTERM', () => {
  void shutdown('SIGTERM');
});

void startBot();