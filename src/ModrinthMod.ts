import { BrowserContext, Locator, Page } from '@playwright/test';

const MODRINTH_URL_BASE = 'https://modrinth.com/';

export class ModrinthMod {
  private page: Page;
  private modGroup: string;
  private options: string[];

  private modalLocator: Locator;

  constructor(page: Page, modGroup: string, options: string[]) {
    this.page = page;
    this.modGroup = modGroup;
    this.options = options;
    this.modalLocator = this.page.locator('.modal-container .modal-body');
  }

  /**
   * Checks if this mod is available for the given version & loader
   */
  async checkForVersion(version: string, loader: string, option?: string): Promise<boolean> {
    for (const option of this.options) {
      const available = await this.checkForVersionForOption(version, loader, option);
      if (available) return true;
    }
    return false;
  }

  private async checkForVersionForOption(version: string, loader: string, option: string): Promise<boolean> {
    await this.goToModPage(option);
    await this.openDownloadMenu();
    await this.toggleGameVersionMenu();
    const versionAvailable = await this.isGameVersionAvailable(version);
    if (!versionAvailable) return false;
    await this.selectGameVersion(version);
    const loaderAvailable = await this.isLoaderAvailable(loader);
    if (!loaderAvailable) return false;
    return true;
  }

  /**
   * Downloads mod for given version
   * filepath if download succeeds
   * null if failed to download
   */
  async downloadForVersion(version: string, loader: string): Promise<string | null> {
    for (const option of this.options) {
      const available = this.checkForVersionForOption(version, loader, option);
      if (!available) continue;
      await this.selectLoader(loader);
      const filepath = await this.downloadFile();
      if (!filepath) continue;
      return filepath;
    }
    return null;
  }

  // ================================================================================

  private async goToModPage(option: string) {
    await this.page.goto(MODRINTH_URL_BASE + option, { waitUntil: 'load', timeout: 120_000 });
    // we need some timeout here because not all scripts have loaded still for some reason.
    // hacky but gets the job done.
    await this.page.waitForTimeout(500);
  }

  private async openDownloadMenu() {
    await this.page.locator('main button', { hasText: 'Download' }).first().click();
    await this.modalLocator.waitFor({ state: 'visible' });
  }

  private async toggleGameVersionMenu() {
    await this.modalLocator.locator('button', { hasText: 'Select game version' }).first().click();
  }

  private async isGameVersionAvailable(version: string): Promise<boolean> {
    try {
      await this.modalLocator
        .locator('.accordion-content.open button', { hasText: version })
        .waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch (err) {
      return false;
    }
  }

  private async selectGameVersion(version: string) {
    await this.modalLocator.locator('.accordion-content.open button', { hasText: version }).first().click();
  }

  private async isLoaderAvailable(loader: string): Promise<boolean> {
    try {
      await this.modalLocator
        .locator('.accordion-content.open button', { hasText: loader === 'datapack' ? 'Data Pack' : loader })
        .waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch (err) {
      return false;
    }
  }

  private async selectLoader(loader: string) {
    await this.modalLocator
      .locator('.accordion-content.open button', { hasText: loader === 'datapack' ? 'Data Pack' : loader })
      .first()
      .click();
  }

  private async downloadFile(): Promise<string | null> {
    return null;
  }
}
