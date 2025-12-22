import { ModListMod } from '../types';
import { ModrinthClient } from './ModrinthClient';

export class ModGroupFetcher {
  private mod: ModListMod;
  private version: string;
  private client: ModrinthClient;

  constructor(mod: ModListMod, version: string, client: ModrinthClient) {
    this.mod = mod;
    this.version = version;
    this.client = client;
  }

  private getModSlug(str: string): string {
    return str.split('/').at(-1) as string;
  }

  async availableForVersion(): Promise<{ option: string; available: boolean }> {
    let selectedOption: string | null = null;
    for (const option of this.mod.options) {
      const version = await this.client.getVersion(this.getModSlug(option), this.version, this.mod.loader);
      if (version) {
        selectedOption = option;
        break;
      }
    }
    return { option: selectedOption ?? '', available: !!selectedOption };
  }

  async download(dir: string): Promise<{ option: string; success: boolean }> {
    const { option, available } = await this.availableForVersion();
    if (!available) return { option: '', success: false };
    const success = await this.client.downloadMod(this.getModSlug(option), this.version, this.mod.loader, dir);
    return { option, success };
  }
}
