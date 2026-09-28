import { test, expect, source, tokenValues } from './fixtures';

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('result tabs expose the selected panel and preserve edits', async ({ page }) => {
  await source(page).fill('#123456');
  const tonal = page.getByRole('tab', { name: 'Tonal palettes', exact: true });
  const tokens = page.getByRole('tab', { name: /Color tokens/ });
  await tokens.click();
  await expect(tokens).toHaveAttribute('aria-selected', 'true');
  await expect(tonal).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByRole('tabpanel')).toHaveAttribute('id', 'tokens-panel');
  await expect(page.getByRole('columnheader')).toHaveText(['Color role', 'Light', 'Dark']);
  await tonal.click();
  await expect(page.getByRole('tabpanel')).toHaveAttribute('id', 'tonal-panel');
  await expect(tonal).toHaveAttribute('aria-selected', 'true');
  await expect(source(page)).toHaveValue('#123456');
});

test('appearance changes site styling but leaves both previews and token values intact', async ({ page }) => {
  const values = await tokenValues(page);
  const backgrounds = await page.locator('.preview-panel').evaluateAll(panels => panels.map(panel => getComputedStyle(panel).backgroundColor));
  await page.getByRole('button', { name: 'Switch appearance', exact: true }).click();
  await expect(page.locator('.site')).toHaveClass('site dark');
  expect(await page.locator('.site').evaluate(el => (el as HTMLElement).style.getPropertyValue('--accent'))).toBe(values['--md-sys-color-primary'][1]);
  expect(await tokenValues(page)).toEqual(values);
  expect(await page.locator('.preview-panel').evaluateAll(panels => panels.map(panel => getComputedStyle(panel).backgroundColor))).toEqual(backgrounds);
  await page.getByRole('button', { name: 'Switch appearance', exact: true }).click();
  await expect(page.locator('.site')).not.toHaveClass(/\bdark\b/);
});

test('preview exploration and saving work independently in each theme', async ({ page }) => {
  const light = page.locator('.preview-panel').first();
  const dark = page.locator('.preview-panel').last();
  await light.getByRole('button', { name: 'Let’s explore' }).click();
  await expect(light.getByText('Your collection', { exact: true })).toBeVisible();
  await expect(dark.locator('.collection')).toHaveCount(0);
  await light.getByRole('button', { name: 'Save idea', exact: true }).click();
  await expect(light.getByRole('button', { name: 'Saved to your collection', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await light.getByRole('button', { name: 'Let’s explore' }).click();
  await expect(light.locator('.collection')).toBeVisible();
  await light.getByRole('button', { name: 'Saved to your collection', exact: true }).click();
  await expect(light.locator('.collection')).toHaveCount(0);
  await expect(light.getByRole('button', { name: 'Save idea', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await dark.getByRole('button', { name: 'Save idea', exact: true }).click();
  await expect(dark.locator('.collection')).toContainText('Saved to your collection');
  await expect(light.locator('.collection')).toHaveCount(0);
});

test('Traditional Chinese translates controls, validation and tokens without losing state', async ({ page }) => {
  await source(page).fill('#123456');
  const values = await tokenValues(page);
  await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('zh-Hant');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('一點色彩，完整系統。');
  await expect(page.getByRole('columnheader')).toHaveText(['色彩角色', '淺色', '深色']);
  await expect(page.locator('tbody tr').first().locator('strong')).toHaveText('主色');
  await expect(page.getByRole('textbox', { name: '來源顏色', exact: true })).toHaveValue('#123456');
  await page.getByRole('textbox', { name: '來源顏色', exact: true }).fill('bad');
  await expect(page.getByRole('complementary').getByRole('alert')).toHaveText('請輸入有效的六位 HEX 色碼。');
  await page.getByRole('combobox', { name: '語言', exact: true }).selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(await tokenValues(page)).toEqual(values);
});

for (const width of [320, 390, 768, 1440]) {
  test(`layout at ${width}px keeps the page within the viewport and controls usable`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Tri-color', exact: true }).click();
    await page.getByRole('textbox', { name: 'Tertiary', exact: true }).fill('#ABCDEF');
    await expect(page.getByRole('textbox', { name: 'Tertiary', exact: true })).toHaveValue('#ABCDEF');
    await tokenValues(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Copy Markdown', exact: true })).toBeVisible();
  });
}

test('keyboard can edit a color, reach controls and activate a preset', async ({ page, browserName }) => {
  // macOS WebKit uses Option-Tab to include buttons in keyboard navigation.
  const tabKey = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
  await source(page).focus();
  await source(page).fill('#FF0000');
  await page.keyboard.press(tabKey);
  await expect(page.getByRole('combobox', { name: 'Source color Color format' })).toBeFocused();
  await page.keyboard.press(tabKey);
  await expect(page.getByRole('button', { name: 'Source color Copy color value' })).toBeFocused();
  await page.getByRole('button', { name: 'Blue hour', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(source(page)).toHaveValue('#507DA6');
});
