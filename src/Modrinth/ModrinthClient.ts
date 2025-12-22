import { createWriteStream, fstat } from 'node:fs';
import { ModrinthVersion } from './types';
import path from 'node:path';
import { Readable } from 'node:stream';
import { writeFile } from 'node:fs/promises';

const API_BASE = 'https://api.modrinth.com/v2';

export class ModrinthClient {
  constructor() {}

  private buildUrl(endpoint: string): URL {
    const e = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return new URL(`/v2${e}`, API_BASE);
  }

  private async getAsJSON<T>(url: URL): Promise<T | null> {
    try {
      const resp = await fetch(new URL(url.href, API_BASE).href);
      if (!resp.ok) return null;
      const val = await resp.json();
      return val as T;
    } catch (err) {
      return null;
    }
  }

  async getVersion(slug: string, gameVersion: string, loader: string): Promise<ModrinthVersion | null> {
    const url = this.buildUrl(`project/${slug}/version`);
    url.searchParams.append('loaders', `["${loader}"]`);
    url.searchParams.append('game_versions', `["${gameVersion}"]`);
    const versions = await this.getAsJSON<ModrinthVersion[]>(url);
    if (!versions || versions.length === 0) return null;
    return versions[0] as ModrinthVersion;
  }

  async downloadMod(slug: string, gameVersion: string, loader: string, outDir: string): Promise<boolean> {
    const version = await this.getVersion(slug, gameVersion, loader);
    if (!version || !version.files || !version.files.length) return false;
    const file = version.files[0];
    if (!file) return false;

    const outputFilepath = path.resolve(outDir, file.filename);

    const response = await fetch(file.url);
    if (!response.ok || !response.body) return false;

    try {
      await writeFile(outputFilepath, response.body);
    } catch (err) {
      return false;
    }

    return true;
  }
}
