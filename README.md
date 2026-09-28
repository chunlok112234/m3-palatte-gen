# M3*Palettes

A responsive Material 3 palette studio built with Next.js, React, and the official Material color utilities.

## Development

```sh
npm install
npm run dev
```

Open `http://localhost:3000`. Use `npm run build` for a production build and `npm start` to serve it.

## Features

- Single-seed and tri-color modes, editable HEX values, native color pickers, mood presets, and randomized inspiration.
- Official HCT tonal palettes and 29 semantic roles. Tri-color mode independently derives secondary and tertiary palettes from their source colors while retaining primary-derived neutral palettes.
- Side-by-side light and dark component previews, with an independent site appearance switch.
- English and Traditional Chinese interface.
- Click-to-copy swatches, a light/dark semantic token table, Markdown and rich HTML clipboard exports.
- Downloadable CSS using `--md-sys-color-*` custom properties, automatic system appearance, and explicit `[data-theme="light"]` / `[data-theme="dark"]` overrides.

Clipboard features require localhost or HTTPS and browser clipboard permission. Rich text copying provides HTML and plain-text clipboard formats.

## Validation

```sh
npm run typecheck
npm run build
```

## Automated browser tests

The Playwright suite tests a production build in Chromium, Firefox, WebKit, and
mobile Chromium (Pixel 7). It starts and stops its own server on port **3100**;
leave that port free. Node.js 22 is used in CI.

```sh
npm ci
npx playwright install --with-deps
npm run test:e2e
```

For quicker local checks or debugging:

```sh
npm run test:e2e -- --project=chromium
npm run test:e2e -- tests/e2e/colors.spec.ts --project=chromium
npm run test:e2e:ui
npm run test:e2e:headed -- --project=chromium
npm run test:e2e:report
```

### Coverage

| Test file | Scenarios |
| --- | --- |
| `tests/e2e/colors.spec.ts` | Initial state; HEX normalization and invalid drafts; RGB, HSV and CMYK editing, ranges and CSS serialization; format switching; black conversion; native picker synchronization |
| `tests/e2e/palettes.spec.ts` | All 29 semantic roles against official Material color utilities; 78 tonal swatches; tri-color independence and retained seeds; six presets; deterministic random colors |
| `tests/e2e/interface.spec.ts` | Result tabs; independent site appearance and preview interactions; Traditional Chinese translations; keyboard operation; 320, 390, 768 and 1440px layouts |
| `tests/e2e/exports.spec.ts` | Swatch/token copy; Markdown and rich HTML payloads; translated exports; clipboard denial and recovery; toast dismissal/expiry; downloaded CSS values and the real browser cascade for automatic and explicit themes |
| `tests/e2e/clipboard-browser.spec.ts` | Real desktop Chromium clipboard permissions, plain text and HTML integration |

Clipboard payload and denial tests use a browser-side fixture to make permission
outcomes deterministic across engines. One separate desktop Chromium test uses
the real clipboard; that integration case is intentionally skipped in Firefox,
WebKit, and the mobile profile. It replaces clipboard contents during execution.
Native picker tests fill the browser's color input; they do not automate the
operating system's color-picker dialog. Responsive tests check interaction and
page overflow, rather than platform-dependent screenshot baselines.

Each test runs in an isolated browser context. CI runs on every push and pull
request, retries failures twice, and uploads the HTML report and failure artifacts
for 14 days. Local runs do not retry. Screenshots, video, and traces are retained
on failure under `test-results/`; the HTML report is in `playwright-report/`.
