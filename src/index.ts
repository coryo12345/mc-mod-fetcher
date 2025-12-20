import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import process from 'node:process';
import { ModList } from './types';
import { getModsAsGroups, sortModListByDependencyOrder } from './ModListUtils';
import { BrowserContext, chromium, devices } from '@playwright/test';
import { ModrinthMod } from './ModrinthMod';
import colors from 'colors';
import { PlaywrightBlocker } from '@ghostery/adblocker-playwright';

colors.enable();

// how long to wait between each attempt at fetching mod info.
// we can get throttled :)
const MOD_DELAY_TIME = 5 * 1000;

async function main(): Promise<void> {
  const options = await getOptions();
  const { links, groups } = getModsAsGroups();

  // set up playwright browser context
  const browser = await chromium.launch({
    headless: !options.debug,
    // downloadsPath: '', // TODO figure out downloads
  });
  const context = await browser.newContext(devices['Desktop Chrome']);

  // this isn't *necessary* but speeds this processes up dramatically.
  const blocker = await PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch);

  const entries = Object.entries(groups);
  const counts = { available: 0, unavailable: 0 };
  for (const entry of entries) {
    const [groupName, modList] = entry;
    console.log(`Processing group ${groupName}...`);
    const { available, unavailable } = await processGroup(modList, options.version, options.download, context, blocker);
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

  await context.close();
  await browser.close();
}

async function processGroup(
  mods: ModList,
  version: string,
  download: boolean,
  context: BrowserContext,
  blocker?: PlaywrightBlocker,
) {
  const count = { available: 0, unavailable: 0 };
  const orderedMods = sortModListByDependencyOrder(mods);
  for (const mod of orderedMods) {
    const page = await context.newPage();
    if (blocker) await blocker.enableBlockingInPage(page);
    const modrinthPage = new ModrinthMod(page, mod.modId, mod.options);

    let msg: string = '';
    if (download) {
      const filepath = await modrinthPage.downloadForVersion(version, mod.loader);
      if (filepath) {
        msg = `✅ ${mod.modId} downloaded`.green;
        count.available++;
      } else {
        msg = `❌ ${mod.modId} failed`.red;
        count.unavailable++;
      }
    } else {
      const exists = await modrinthPage.checkForVersion(version, mod.loader);
      if (exists) {
        msg = `✅ ${mod.modId} is available`.green;
        count.available++;
      } else {
        msg = `❌ ${mod.modId} is not updated`.red;
        count.unavailable++;
      }
    }
    console.log('\t ' + msg);
    await page.close();
    await sleep(MOD_DELAY_TIME);
  }

  return count;
}

async function getOptions() {
  const argv = await yargs(hideBin(process.argv)).parse();
  if (argv._.length < 1) {
    throw new Error('MC Version not supplied. See README.md');
  }
  return {
    version: argv['_'][0]?.toString() ?? '',
    download: Boolean(argv.download) ?? false,
    debug: Boolean(argv.debug) ?? false,
  } as const;
}

const sleep = (ms: number) => {
  return new Promise(res => {
    setTimeout(res, ms);
  })
}

main();
