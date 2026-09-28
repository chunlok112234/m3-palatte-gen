import { test, expect, source, format, colorCopy, clipboard } from './fixtures';

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('initial state exposes the source, two previews and all 78 tonal swatches', async ({ page }) => {
  await expect(page).toHaveTitle('M3*Palettes — A little color. A whole system.');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A little color.A whole system.');
  await expect(source(page)).toHaveValue('#52796F');
  await expect(page.getByRole('button', { name: 'Single color', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Tri-color', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.preview-panel')).toHaveCount(2);
  await expect(page.getByRole('tabpanel').getByRole('button')).toHaveCount(78);
  await expect(page.getByRole('button', { name: 'Fresh mint', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

for (const value of ['#abcdef', '123456', '#000000', '#FFFFFF']) {
  test(`accepts HEX ${value} and publishes normalized color`, async ({ page }) => {
    await source(page).fill(value);
    await expect(source(page)).toHaveAttribute('aria-invalid', 'false');
    await expect(page.getByLabel('Source color Color picker', { exact: true })).toHaveValue(`#${value.replace('#', '').toLowerCase()}`);
    await colorCopy(page).click();
    expect(await clipboard(page)).toEqual({ 'text/plain': `#${value.replace('#', '').toUpperCase()}` });
  });
}

for (const value of ['', '#', '#123', '#GGGGGG', '12 456']) {
  test(`invalid HEX ${JSON.stringify(value)} preserves the palette and recovers`, async ({ page }) => {
    const before = await page.getByRole('tabpanel').innerHTML();
    await source(page).fill(value);
    await expect(source(page)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('complementary').getByRole('alert')).toHaveText('Enter a valid 6-digit hex color.');
    await expect(colorCopy(page)).toBeDisabled();
    expect(await page.getByRole('tabpanel').innerHTML()).toBe(before);
    await source(page).fill('#FF0000');
    await expect(page.getByRole('complementary').getByRole('alert')).toHaveCount(0);
    await expect(colorCopy(page)).toBeEnabled();
  });
}

const formats = [
  { name: 'RGB', labels: ['R', 'G', 'B'], values: ['255', '0', '0'], css: 'rgb(255 0 0)', invalid: ['-1', '256', '1.5', ''] },
  { name: 'HSV', labels: ['H', 'S', 'V'], values: ['360', '100', '100'], css: 'hsl(360 100% 50%)', invalid: ['-1', '361', ''] },
  { name: 'CMYK', labels: ['C', 'M', 'Y', 'K'], values: ['0', '100', '100', '0'], css: 'device-cmyk(0% 100% 100% 0%, rgb(255 0 0))', invalid: ['-1', '101', ''] },
];
for (const spec of formats) {
  test(`${spec.name} editing converts to red and copies valid CSS`, async ({ page }) => {
    await format(page).selectOption(spec.name);
    for (const [i, label] of spec.labels.entries()) {
      await page.getByRole('spinbutton', { name: `Source color ${spec.name} ${label}`, exact: true }).fill(spec.values[i]);
    }
    await expect(page.locator('.color-value')).toHaveText('#FF0000');
    await colorCopy(page).click();
    expect(await clipboard(page)).toEqual({ 'text/plain': spec.css });
    await format(page).selectOption('HEX');
    await expect(source(page)).toHaveValue('#FF0000');
  });
  for (const invalid of spec.invalid) {
    test(`${spec.name} rejects ${JSON.stringify(invalid)} without publishing`, async ({ page }) => {
      await format(page).selectOption(spec.name);
      const channel = page.getByRole('spinbutton').first();
      const previous = await channel.inputValue();
      const before = await page.getByRole('tabpanel').innerHTML();
      await channel.fill(invalid);
      await expect(channel).toHaveAttribute('aria-invalid', 'true');
      await expect(page.getByRole('complementary').getByRole('alert')).toBeVisible();
      await expect(colorCopy(page)).toBeDisabled();
      expect(await page.getByRole('tabpanel').innerHTML()).toBe(before);
      await channel.fill(previous);
      await expect(page.getByRole('complementary').getByRole('alert')).toHaveCount(0);
      await expect(colorCopy(page)).toBeEnabled();
    });
  }
}

test('HSV saturation/value and every CMYK channel enforce percentage limits', async ({ page }) => {
  for (const [name, labels] of [['HSV', ['S', 'V']], ['CMYK', ['C', 'M', 'Y', 'K']]] as const) {
    await format(page).selectOption(name);
    for (const label of labels) {
      const input = page.getByRole('spinbutton', { name: `Source color ${name} ${label}`, exact: true });
      const original = await input.inputValue();
      await input.fill('100.1');
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(colorCopy(page)).toBeDisabled();
      await input.fill(original);
      await expect(colorCopy(page)).toBeEnabled();
    }
  }
});

test('format switching resets invalid drafts and represents black without NaN', async ({ page }) => {
  await source(page).fill('#000000');
  await source(page).fill('bad');
  await format(page).selectOption('CMYK');
  await expect(page.getByRole('complementary').getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('spinbutton')).toHaveCount(4);
  for (const [i, value] of ['0', '0', '0', '100'].entries()) await expect(page.getByRole('spinbutton').nth(i)).toHaveValue(value);
  await format(page).selectOption('HSV');
  for (const input of await page.getByRole('spinbutton').all()) await expect(input).toHaveValue('0');
  await colorCopy(page).click();
  expect(await clipboard(page)).toEqual({ 'text/plain': 'hsl(0 0% 0%)' });
});

test('native picker updates active channels and clears invalid drafts', async ({ page }) => {
  await format(page).selectOption('RGB');
  await page.getByRole('spinbutton').first().fill('999');
  await page.getByLabel('Source color Color picker', { exact: true }).fill('#00ff00');
  await expect(page.getByRole('complementary').getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.color-value')).toHaveText('#00FF00');
  for (const [i, value] of ['0', '255', '0'].entries()) await expect(page.getByRole('spinbutton').nth(i)).toHaveValue(value);
});
