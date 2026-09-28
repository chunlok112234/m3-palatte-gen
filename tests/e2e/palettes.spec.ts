import { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';
import { test, expect, source, format, tokenValues } from './fixtures';

test.beforeEach(async ({ page }) => { await page.goto('/'); });

for (const seed of ['#52796F', '#FF0000', '#000000', '#FFFFFF']) {
  test(`all semantic roles match official Material 3 for ${seed}`, async ({ page }) => {
    await source(page).fill(seed);
    const actual = await tokenValues(page);
    const reference = themeFromSourceColor(argbFromHex(seed));
    for (const [role, light] of Object.entries(reference.schemes.light.toJSON())) {
      const variable = `--md-sys-color-${role.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)}`;
      const dark = reference.schemes.dark.toJSON()[role as keyof ReturnType<typeof reference.schemes.dark.toJSON>];
      expect(actual[variable], variable).toEqual([hexFromArgb(light).toUpperCase(), hexFromArgb(dark).toUpperCase()]);
    }
    expect(Object.keys(actual)).toHaveLength(29);
  });
}

test('all tonal families have black/white endpoints and distinct intermediate shades', async ({ page }) => {
  for (const family of ['Primary', 'Secondary', 'Tertiary', 'Neutral', 'Neutral Variant', 'Error']) {
    await expect(page.getByRole('button', { name: `${family} 0: #000000`, exact: true })).toBeAttached();
    await expect(page.getByRole('button', { name: `${family} 100: #FFFFFF`, exact: true })).toBeAttached();
  }
  for (const row of await page.locator('.tone-row').all()) {
    const labels = await row.getByRole('button').evaluateAll(buttons => buttons.map(b => b.getAttribute('aria-label')!.split(': ')[1]));
    expect(new Set(labels).size).toBe(13);
  }
});

test('tri-color edits affect only their own semantic families and survive mode switching', async ({ page }) => {
  await page.getByRole('button', { name: 'Tri-color', exact: true }).click();
  await expect(page.locator('.color-field > .color-input > input')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Tri-color', exact: true })).toHaveAttribute('aria-pressed', 'true');
  let before = await tokenValues(page);
  for (const [label, value, family] of [['Secondary', '#00FF00', 'secondary'], ['Tertiary', '#0000FF', 'tertiary']]) {
    await page.getByRole('textbox', { name: label, exact: true }).fill(value);
    const after = await tokenValues(page);
    expect(after[`--md-sys-color-${family}`]).not.toEqual(before[`--md-sys-color-${family}`]);
    for (const key of Object.keys(before).filter(key => !key.includes(family))) expect(after[key], key).toEqual(before[key]);
    before = after;
  }
  await page.getByRole('button', { name: 'Single color', exact: true }).click();
  await expect(page.locator('.color-field > .color-input > input')).toHaveCount(1);
  const single = await tokenValues(page);
  expect(single['--md-sys-color-secondary']).not.toEqual(before['--md-sys-color-secondary']);
  await page.getByRole('button', { name: 'Tri-color', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Secondary', exact: true })).toHaveValue('#00FF00');
  await expect(page.getByRole('textbox', { name: 'Tertiary', exact: true })).toHaveValue('#0000FF');
  expect(await tokenValues(page)).toEqual(before);
});

for (const [name, hex] of [['Fresh mint', '#52796F'], ['Soft violet', '#8B74B4'], ['Blue hour', '#507DA6'], ['Peach fuzz', '#D58D6E'], ['Rose garden', '#AD687C'], ['Olive grove', '#7A8052']]) {
  test(`preset ${name} selects its color and preserves other tri-color seeds`, async ({ page }) => {
    await page.getByRole('button', { name: 'Tri-color', exact: true }).click();
    await page.getByRole('textbox', { name: 'Primary', exact: true }).fill('#123456');
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Primary', exact: true })).toHaveValue(hex);
    await expect(page.getByRole('textbox', { name: 'Secondary', exact: true })).toHaveValue('#8B74B4');
    await expect(page.getByRole('textbox', { name: 'Tertiary', exact: true })).toHaveValue('#D58D6E');
    await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.moods button[aria-pressed="true"]')).toHaveCount(1);
  });
}

test('preset replaces invalid channel drafts', async ({ page }) => {
  await format(page).selectOption('RGB');
  await page.getByRole('spinbutton').first().fill('999');
  await page.getByRole('button', { name: 'Blue hour', exact: true }).click();
  await expect(page.getByRole('complementary').getByRole('alert')).toHaveCount(0);
  for (const [i, value] of ['80', '125', '166'].entries()) await expect(page.getByRole('spinbutton').nth(i)).toHaveValue(value);
});

test('surprise generates three valid colors and updates the system', async ({ page }) => {
  const before = await tokenValues(page);
  // Deterministic randomness avoids probabilistic assertions while exercising the UI.
  await page.evaluate(() => { const values = [0, 0.5, 0.99999999]; let i = 0; Math.random = () => values[i++ % values.length]; });
  await page.getByRole('button', { name: 'Surprise me', exact: true }).click();
  await expect(source(page)).toHaveValue('#000000');
  await page.getByRole('button', { name: 'Tri-color', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Secondary', exact: true })).toHaveValue('#7FFFFF');
  await expect(page.getByRole('textbox', { name: 'Tertiary', exact: true })).toHaveValue('#FFFFFE');
  expect(await tokenValues(page)).not.toEqual(before);
});
