import { ModList, ModListMod } from './types';
import mods from '../mods.json';

export function sortModListByDependencyOrder(mods: ModList): ModListMod[] {
  const itemsToProcess: ModListMod[] = Object.values(mods);
  const orderedMods: ModListMod[] = [];
  while (itemsToProcess.length > 0) {
    const item = itemsToProcess.shift();
    if (!item) break;

    let dependenciesSatisfied = true;
    for (const dep of item.dependsOn ?? []) {
      if (!orderedMods.find((om) => om.modId === dep)) {
        dependenciesSatisfied = false;
        break;
      }
    }

    if (!item.dependsOn || dependenciesSatisfied) {
      orderedMods.push(item);
    } else {
      itemsToProcess.push(item);
    }
  }

  return orderedMods;
}

export function getModsAsGroups(options?: { includeClient?: boolean; includeServer?: boolean }) {
  const links: string[] = [];
  const groups: Record<string, ModList> = {};
  Object.entries(mods).forEach(([environment, modlist]) => {
    if (environment === 'links') {
      links.push(...(modlist as string[]));
      return;
    }
    const validClient = (options?.includeClient ?? true) && environment === 'client';
    const validServer = (options?.includeServer ?? true) && environment === 'server';
    if (validClient || validServer) {
      Object.entries(modlist).forEach(([modId, config]) => {
        const loader = config.loader ?? 'fabric';
        const groupKey = `${environment}-${loader}`;
        if (!groups[groupKey]) groups[groupKey] = {};
        groups[groupKey][modId] = { ...config, loader, modId, environment };
      });
    }
  });
  return { groups, links };
}
