import { test as base, expect, type Page } from '@playwright/test';

declare global {
  interface Window {
    testClipboard: { fail: boolean; writes: Record<string, string>[] };
  }
}

// Capture exactly what the app sends to the browser clipboard. Real browser
// permission behavior is covered separately in the Chromium integration test.
export const test = base.extend<{ clipboard: void }>({
  clipboard: [async ({ page }, use) => {
    await page.addInitScript(() => {
      window.testClipboard = { fail: false, writes: [] };
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            if (window.testClipboard.fail) throw new DOMException('Permission denied', 'NotAllowedError');
            window.testClipboard.writes.push({ 'text/plain': text });
          },
          write: async (items: ClipboardItem[]) => {
            if (window.testClipboard.fail) throw new DOMException('Permission denied', 'NotAllowedError');
            for (const item of items) {
              const entry: Record<string, string> = {};
              for (const type of item.types) entry[type] = await (await item.getType(type)).text();
              window.testClipboard.writes.push(entry);
            }
          },
        },
      });
    });
    await use();
  }, { auto: true }],
});
export { expect };
export const source = (page: Page) => page.getByRole('textbox', { name: 'Source color', exact: true });
export const format = (page: Page) => page.getByRole('combobox', { name: 'Source color Color format', exact: true });
export const colorCopy = (page: Page) => page.getByRole('button', { name: 'Source color Copy color value', exact: true });
export const tokens = async (page: Page) => {
  await page.getByRole('tab', { name: /Color tokens/ }).click();
  await expect(page.locator('tbody tr')).toHaveCount(29);
};
export const tokenValues = async (page: Page) => {
  await tokens(page);
  return page.locator('tbody tr').evaluateAll(rows => Object.fromEntries(rows.map(row => [
    row.querySelector('td code')!.textContent!,
    Array.from(row.querySelectorAll('button code'), node => node.textContent!),
  ])));
};
export const clipboard = (page: Page) => page.evaluate(() => window.testClipboard.writes.at(-1));
