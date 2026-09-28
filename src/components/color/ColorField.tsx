"use client";

import { useId, useState } from "react";
import { channelsToHex, hexToChannels, colorCopyValue, type ColorFormat } from "@/lib/color";
import type { ColorLabels } from "@/lib/color-labels";
import ColorFormatSelect from "./ColorFormatSelect";
import CopyColorButton from "./CopyColorButton";
import "./color-field.css";

const channelDrafts = (hex: string, format: ColorFormat) => format === "HEX" ? [] : hexToChannels(hex, format).map(value => String(Math.round(value * 100) / 100));

export default function ColorField({ value, label, t, onChange }: { value: string; label: string; t: ColorLabels; onChange: (value: string) => void }) {
  const id = useId();
  const [format, setFormat] = useState<ColorFormat>("HEX");
  const [source, setSource] = useState(value);
  const [hex, setHex] = useState(value);
  const [channels, setChannels] = useState<string[]>([]);
  const [error, setError] = useState(false);
  // External changes (presets, shuffle, native picker) replace any unfinished edits.
  if (source !== value) {
    setSource(value); setHex(value); setChannels(channelDrafts(value, format)); setError(false);
  }
  const publish = (next: string) => { setSource(next); onChange(next); };
  const changeFormat = (next: ColorFormat) => {
    setFormat(next); setHex(value); setChannels(channelDrafts(value, next)); setError(false);
  };
  const changeHex = (draft: string) => {
    setHex(draft);
    const normalized = draft.startsWith("#") ? draft : `#${draft}`;
    const valid = /^#[0-9a-f]{6}$/i.test(normalized);
    setError(!valid);
    if (valid) publish(normalized.toUpperCase());
  };
  const channelNames = format === "RGB" ? ["R", "G", "B"] : format === "HSL" ? ["H", "S", "L"] : format === "HSV" ? ["H", "S", "V"] : ["C", "M", "Y", "K"];
  const maxAt = (index: number) => format === "RGB" ? 255 : (format === "HSL" || format === "HSV") && index === 0 ? 360 : 100;
  const validChannel = (draft: string, index: number) => draft.trim() !== "" && Number.isFinite(Number(draft)) && Number(draft) >= 0 && Number(draft) <= maxAt(index) && (format !== "RGB" || Number.isInteger(Number(draft)));
  const changeChannel = (index: number, draft: string) => {
    const next = channels.map((value, i) => i === index ? draft : value);
    setChannels(next);
    const valid = next.every(validChannel);
    setError(!valid);
    if (valid && format !== "HEX") publish(channelsToHex(next.map(Number), format));
  };
  return <div className="color-field">
    <label htmlFor={id}>{label}</label>
    <div className={`color-input ${error ? "invalid" : ""}`}>
      <div className="color-picker" style={{ background: value }}><input type="color" value={value} aria-label={`${label} ${t.colorPicker}`} onChange={event => { const next = event.target.value.toUpperCase(); setHex(next); setChannels(channelDrafts(next, format)); setError(false); publish(next); }}/></div>
      {format === "HEX" ? <input id={id} value={hex} maxLength={7} aria-invalid={error} aria-describedby={error ? `${id}-error` : undefined} onChange={event => changeHex(event.target.value)} spellCheck={false}/> : <output id={id} className="color-value">{value}</output>}
      <ColorFormatSelect value={format} label={`${label} ${t.colorFormat}`} onChange={changeFormat}/>
      <CopyColorButton value={colorCopyValue(value, format, format === "HEX" || error ? undefined : channels.map(Number))} disabled={error} label={`${label} ${t.copyColorValue}`} t={t}/>
    </div>
    {format !== "HEX" && <div className="color-channels">{channelNames.map((name, index) => <label key={`${format}-${name}`}><span>{name}<span>{format === "RGB" ? "" : maxAt(index) === 360 ? "°" : "%"}</span></span><input aria-label={`${label} ${format} ${name}`} type="number" min={0} max={maxAt(index)} step={format === "RGB" ? 1 : "any"} value={channels[index]} aria-invalid={!validChannel(channels[index] ?? "", index)} aria-describedby={error ? `${id}-error` : undefined} onChange={event => changeChannel(index, event.target.value)}/></label>)}</div>}
    {error && <span className="error-text" id={`${id}-error`} role="alert">{format === "HEX" ? t.invalid : format === "RGB" ? t.invalidRgb : format === "HSL" ? t.invalidHsl : format === "HSV" ? t.invalidHsv : t.invalidCmyk}</span>}
  </div>;
}
