// could be missing some here
export type Loader = 'fabric' | 'datapack' | 'forge' | 'neoforge' | 'spigot' | 'paper' | 'bukkit';

export type ModListMod = {
  options: string[];
  loader: string;
  modId: string;
  environment: string;
  dependsOn?: string[];
};

export type ModList = Record<string, ModListMod>;
