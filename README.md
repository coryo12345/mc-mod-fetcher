# mc-mod-fetcher
get all my preferred mods but in a script

## Setup
run `npm install && npm run install`

## Run
To check versions of mods for a specfic game version (e.g. 1.21.11) run:
```bash
npm run start -- 1.21.11
```

To download mods for a specific version run:
```bash
npm run start -- 1.21.11 --download
```

## Configuring Mods
In `mods.json`, mods are stored in categories. Mods MUST be on Modrinth.

The values should be the URL slug of the mod. e.g. for `https://modrinth.com/plugin/worldedit`, the value should be `worldedit`.

If there are multiple mods in a group, we will check the version of all of them when checking. 

When downloading, only the first item in a group that matches the version will be downloaded. This allows for fallback versions of mods if necessary.

## TODO
- sort mods by env/loader