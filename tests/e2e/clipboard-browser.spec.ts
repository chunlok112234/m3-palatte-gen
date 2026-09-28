import { test, expect } from '@playwright/test';

// No clipboard fixture: this verifies the actual browser integration on localhost.
// Firefox/WebKit permission APIs differ, so their payloads and failures are
// exercised through the deterministic fixture in exports.spec.ts.
test('Chromium writes plain text and rich HTML to the real browser clipboard', async ({ page, context, browserName, isMobile }) => {
  test.skip(browserName !== 'chromium' || isMobile, 'Desktop Chromium clipboard permission integration');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: 'Source color Copy color value', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Copied to clipboard');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('#52796F');
  await page.getByRole('button', { name: 'Copy rich text', exact: true }).click();
  await expect(page.locator('.toast')).toHaveText('Copied to clipboard');
  const types = await page.evaluate(async () => (await navigator.clipboard.read())[0].types);
  expect(types).toContain('text/html');
  expect(types).toContain('text/plain');
  expect((await page.evaluate(() => navigator.clipboard.readText())).split('\n')).toHaveLength(31);
});
