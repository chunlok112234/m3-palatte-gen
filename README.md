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
