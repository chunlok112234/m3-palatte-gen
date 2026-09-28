import { readFile } from 'node:fs/promises';
import { test, expect, source, colorCopy, clipboard, tokenValues, tokens } from './fixtures';

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('tonal swatch and light/dark token buttons copy their displayed HEX', async ({ page }) => {
  const swatch = page.getByRole('button', { name: /^Primary 40:/ });
  const hex = (await swatch.getAttribute('aria-label'))!.split(': ')[1];
  await swatch.click();
  expect(await clipboard(page)).toEqual({ 'text/plain': hex });
  await expect(page.getByRole('status')).toHaveText('Copied to clipboard');
  await tokens(page);
  for (const button of await page.locator('tbody tr').first().getByRole('button').all()) {
    const value = await button.locator('code').innerText();
    await button.click();
    expect(await clipboard(page)).toEqual({ 'text/plain': value });
  }
});

for (const panel of ['tonal', 'tokens']) {
  test(`Markdown export from ${panel} contains all current light and dark roles`, async ({ page }) => {
    await source(page).fill('#FF0000');
    const values = await tokenValues(page);
    if (panel === 'tonal') await page.getByRole('tab', { name: 'Tonal palettes', exact: true }).click();
    await page.getByRole('button', { name: 'Copy Markdown', exact: true }).click();
    const content = (await clipboard(page))!['text/plain'];
    const lines = content.split('\n');
    expect(lines.slice(0, 2)).toEqual(['| Color role | Light | Dark |', '| --- | --- | --- |']);
    expect(lines).toHaveLength(31);
    for (const [i, pair] of Object.values(values).entries()) {
      expect(lines[i + 2]).toContain(`| ${pair[0]} | ${pair[1]} |`);
    }
  });
}

test('rich clipboard export includes styled HTML and a complete plain-text fallback', async ({ page }) => {
  const values = await tokenValues(page);
  await page.getByRole('button', { name: 'Copy rich text', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Copied to clipboard');
  const data = (await clipboard(page))!;
  expect(Object.keys(data).sort()).toEqual(['text/html', 'text/plain']);
  expect(data['text/plain'].split('\n')).toHaveLength(31);
  const parsed = await page.evaluate(html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return Array.from(doc.querySelectorAll('tbody tr'), row => Array.from(row.querySelectorAll('td')).slice(1).map(cell => ({ text: cell.textContent, background: cell.style.backgroundColor, foreground: cell.style.color })));
  }, data['text/html']);
  expect(parsed).toHaveLength(29);
  for (const [i, pair] of Object.values(values).entries()) {
    expect(parsed[i].map(cell => cell.text)).toEqual(pair);
    for (const cell of parsed[i]) { expect(cell.background).not.toBe(''); expect(cell.foreground).not.toBe(''); }
  }
});

test('localized exports use Traditional Chinese role labels', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('zh-Hant');
  await page.getByRole('button', { name: '複製 Markdown', exact: true }).click();
  expect((await clipboard(page))!['text/plain']).toMatch(/^\| 色彩角色 \| 淺色 \| 深色 \|/);
  expect((await clipboard(page))!['text/plain']).toContain('| 主色 |');
  await page.getByRole('button', { name: '複製富文字', exact: true }).click();
  await expect.poll(async () => (await clipboard(page))?.['text/html']).toContain('<th>色彩角色</th>');
  await expect(page.getByRole('status')).toHaveText('已複製到剪貼簿');
});

for (const action of ['field', 'swatch', 'markdown', 'rich']) {
  test(`clipboard denial for ${action} displays an error and allows retry`, async ({ page }) => {
    await page.evaluate(() => { window.testClipboard.fail = true; });
    const button = action === 'field' ? colorCopy(page) : action === 'swatch' ? page.getByRole('button', { name: /^Primary 40:/ }) : page.getByRole('button', { name: action === 'markdown' ? 'Copy Markdown' : 'Copy rich text', exact: true });
    await button.click();
    await expect(page.getByRole('status')).toHaveText('Clipboard unavailable. Please try in a secure browser context.');
    expect(await clipboard(page)).toBeUndefined();
    await page.evaluate(() => { window.testClipboard.fail = false; });
    await button.click();
    await expect(page.getByRole('status')).toHaveText('Copied to clipboard');
    expect(await clipboard(page)).toBeDefined();
  });
}

test('global toast can be dismissed and expires automatically', async ({ page }) => {
  await page.clock.install();
  await page.getByRole('button', { name: /^Primary 40:/ }).click();
  await expect(page.getByRole('status')).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.getByRole('button', { name: /^Primary 50:/ }).click();
  await expect(page.getByRole('status')).toBeVisible();
  await page.clock.fastForward(3100);
  await expect(page.getByRole('status')).toHaveCount(0);
});

test('field copy feedback expires and resets when the color changes', async ({ page }) => {
  await page.clock.install();
  await colorCopy(page).click();
  await expect(page.getByRole('status')).toBeVisible();
  await page.clock.fastForward(2600);
  await expect(page.getByRole('status')).toHaveCount(0);
  await colorCopy(page).click();
  await expect(page.getByRole('status')).toBeVisible();
  await source(page).fill('#123456');
  await expect(page.getByRole('status')).toHaveCount(0);
});

for (const tri of [false, true]) {
  test(`downloaded CSS has complete tokens and working theme overrides (${tri ? 'tri' : 'single'})`, async ({ page }) => {
    await source(page).fill('#123456');
    if (tri) {
      await page.getByRole('button', { name: 'Tri-color', exact: true }).click();
      await page.getByRole('textbox', { name: 'Secondary', exact: true }).fill('#FF0000');
    }
    const values = await tokenValues(page);
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download CSS/ }).click();
    const download = await pending;
    expect(download.suggestedFilename()).toBe('m3-palettes.css');
    expect(await download.failure()).toBeNull();
    const css = await readFile((await download.path())!, 'utf8');
    expect(css.match(/--md-sys-color-[\w-]+:/g)).toHaveLength(87);
    await expect(page.getByRole('status')).toHaveText('Your CSS is ready');
    // Apply the exported stylesheet in a real document and inspect its cascade.
    await page.setContent(`<style>${css}</style><p>CSS export validation</p>`);
    for (const system of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: system });
      for (const override of [null, 'light', 'dark']) {
        await page.evaluate(theme => {
          if (theme) document.documentElement.dataset.theme = theme;
          else delete document.documentElement.dataset.theme;
        }, override);
        const actual = await page.evaluate(keys => {
          const style = getComputedStyle(document.documentElement);
          return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key).trim()]));
        }, Object.keys(values));
        const index = (override ?? system) === 'dark' ? 1 : 0;
        for (const [key, pair] of Object.entries(values)) expect(actual[key], `${system}/${override}/${key}`).toBe(pair[index]);
      }
    }
  });
}
