import { argbFromHex, hexFromArgb, themeFromSourceColor, TonalPalette } from "@material/material-color-utilities";

export const tones = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];
export function createPalette(colors: string[], tri: boolean) {
  const theme = themeFromSourceColor(argbFromHex(colors[0]));
  const palettes = { ...theme.palettes };
  if (tri) {
    palettes.secondary = TonalPalette.fromInt(argbFromHex(colors[1]));
    palettes.tertiary = TonalPalette.fromInt(argbFromHex(colors[2]));
  }
  const light = theme.schemes.light.toJSON();
  const dark = theme.schemes.dark.toJSON();
  if (tri) {
    for (const key of ["secondary", "tertiary"] as const) {
      const p = palettes[key];
      const cap = key[0].toUpperCase() + key.slice(1);
      Object.assign(light, { [key]: p.tone(40), [`on${cap}`]: p.tone(100), [`${key}Container`]: p.tone(90), [`on${cap}Container`]: p.tone(10) });
      Object.assign(dark, { [key]: p.tone(80), [`on${cap}`]: p.tone(20), [`${key}Container`]: p.tone(30), [`on${cap}Container`]: p.tone(90) });
    }
  }
  const hex = (scheme: Record<string, number>) => Object.fromEntries(Object.entries(scheme).map(([key, value]) => [key, hexFromArgb(value).toUpperCase()]));
  return { light: hex(light), dark: hex(dark), palettes };
}
export const kebab = (value: string) => value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
export function exportCSS(light: Record<string, string>, dark: Record<string, string>) {
  const variables = (scheme: Record<string, string>) => Object.entries(scheme).map(([key, value]) => `  --md-sys-color-${kebab(key)}: ${value};`).join("\n");
  return `/* Generated with M3*Palettes · Material 3 color tokens */\n:root, [data-theme="light"] {\n${variables(light)}\n}\n\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n${variables(dark)}\n  }\n}\n\n[data-theme="dark"] {\n${variables(dark)}\n}\n`;
}
