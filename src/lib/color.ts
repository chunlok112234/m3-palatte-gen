
export function contrastText(hex: string) {
  const values = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722 > 0.179 ? "#17211E" : "#FFFFFF";
}

export type ColorFormat = "HEX" | "RGB" | "HSL" | "HSV" | "CMYK";
export function hexToChannels(hex: string, format: Exclude<ColorFormat, "HEX">): number[] {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  if (format === "RGB") return [r, g, b].map(value => Math.round(value * 255));
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  if (format === "CMYK") return max === 0 ? [0, 0, 0, 100] : [(max-r)/max*100, (max-g)/max*100, (max-b)/max*100, (1-max)*100];
  let hue = 0;
  if (delta) hue = 60 * (max === r ? ((g-b)/delta + 6) % 6 : max === g ? (b-r)/delta + 2 : (r-g)/delta + 4);
  if (format === "HSL") {
    const lightness = (max + min) / 2;
    const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
    return [hue, saturation * 100, lightness * 100];
  }
  return [hue, max === 0 ? 0 : delta/max*100, max*100];
}
export function channelsToHex(channels: number[], format: Exclude<ColorFormat, "HEX">): string {
  let rgb: number[];
  if (format === "RGB") {
    rgb = channels.map(value => value / 255);
  } else if (format === "CMYK") {
    const [c, m, y, k] = channels.map(value => value / 100);
    rgb = [c, m, y].map(value => (1-value)*(1-k));
  } else {
    const [h, s, third] = [channels[0] % 360 / 60, channels[1]/100, channels[2]/100];
    const c = format === "HSL" ? (1 - Math.abs(2 * third - 1)) * s : third * s;
    const x = c*(1-Math.abs(h%2-1)), m = format === "HSL" ? third - c/2 : third - c;
    rgb = (h < 1 ? [c,x,0] : h < 2 ? [x,c,0] : h < 3 ? [0,c,x] : h < 4 ? [0,x,c] : h < 5 ? [x,0,c] : [c,0,x]).map(value => value+m);
  }
  return '#'+rgb.map(value => Math.round(Math.max(0, Math.min(1, value))*255).toString(16).padStart(2,'0')).join('').toUpperCase();
}


const cssNumber = (value: number) => String(Math.round(value * 10000) / 10000);

export function colorCopyValue(hex: string, format: ColorFormat, channels?: number[]): string {
  if (format === "HEX") return hex.toUpperCase();
  const values = channels ?? hexToChannels(hex, format);
  if (format === "RGB") return `rgb(${values.map(cssNumber).join(" ")})`;
  if (format === "CMYK") {
    const fallback = hexToChannels(hex, "RGB").join(" ");
    return `device-cmyk(${values.map(value => `${cssNumber(value)}%`).join(" ")}, rgb(${fallback}))`;
  }
  if (format === "HSV") return values.map(cssNumber).join(" ");
  return `hsl(${cssNumber(values[0])} ${cssNumber(values[1])}% ${cssNumber(values[2])}%)`;
}
