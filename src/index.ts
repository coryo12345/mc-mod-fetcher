import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import process from 'node:process';
import { ModList } from './types';
import { getModsAsGroups, sortModListByDependencyOrder } from './ModListUtils';
import colors from '@colors/colors';
import { ModrinthClient } from './Modrinth/ModrinthClient';
import { ModGroupFetcher } from './Modrinth/ModGroupFetcher';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

colors.enable();

let client: ModrinthClient | null = null;
const OUTPUT_DIR = path.resolve(import.meta.dirname, '..', 'mods');

async function main(): Promise<void> {
  const options = await getOptions();
  const { links, groups } = getModsAsGroups({ includeClient: !options.serverOnly, includeServer: !options.clientOnly });

  client = new ModrinthClient();

  const entries = Object.entries(groups);
  const counts = { available: 0, unavailable: 0 };
  for (const entry of entries) {
    const [groupName, modList] = entry;
    console.log(`Processing group ${groupName}...`);
    const { available, unavailable } = await processGroup(modList, options.version, options.download);
    counts.available += available;
    counts.unavailable += unavailable;
  }

  console.log('');
  console.log(`Available mods: ${counts.available}`.green);
  console.log(`Unavailable mods: ${counts.unavailable}`.red);
  console.log('');

  console.log('The following extra items also need to be handled:');
  links.forEach((link) => {
    console.log(link);
  });
}

async function processGroup(mods: ModList, version: string, download: boolean) {
  if (!client) throw new Error('Modrinth Client not initiailized');

  const count = { available: 0, unavailable: 0 };
  const orderedMods = sortModListByDependencyOrder(mods);
  for (const mod of orderedMods) {
    const modFetcher = new ModGroupFetcher(mod, version, client);

    let msg: string = '';
    if (download) {
      const dir = path.resolve(OUTPUT_DIR, version, `${mod.environment}-${mod.loader}`);
      await mkdir(dir, { recursive: true });

      const { option, success } = await modFetcher.download(dir);
      if (success) {
        msg = `✅ ${mod.modId} downloaded: ${option}`.green;
        count.available++;
      } else {
        msg = `❌ ${mod.modId} failed`.red;
        count.unavailable++;
      }
    } else {
      const { option, available } = await modFetcher.availableForVersion();
      if (available) {
        msg = `✅ ${mod.modId} is available: ${option}`.green;
        count.available++;
      } else {
        msg = `❌ ${mod.modId} is not updated`.red;
        count.unavailable++;
      }
    }
    console.log('\t ' + msg);
  }

  return count;
}

async function getOptions() {
  const argv = await yargs(hideBin(process.argv)).parse();
  if (argv._.length < 1) {
    throw new Error('MC Version not supplied. See README.md');
  }
  const opts = {
    version: argv['_'][0]?.toString() ?? '',
    download: Boolean(argv.download) ?? false,
    clientOnly: Boolean(argv.client) ?? false,
    serverOnly: Boolean(argv.server) ?? false,
  } as const;
  if (opts.clientOnly && opts.serverOnly) throw new Error('Cannot set both --client and --server');
  return opts;
}

main();
