"use client";
import { Palette, Shuffle, Sparkles } from "lucide-react";
import type { ColorLabels } from "@/lib/color-labels";
import ColorField from "./ColorField";
import ColorPresets from "./ColorPresets";
export default function ColorControls({tri, setTri, colors, setColor, applyColors, surprise, t}: {tri: boolean; setTri: (value: boolean) => void; colors: string[]; setColor: (index: number, value: string) => void; applyColors: (colors: string[]) => void; surprise: () => void; t: ColorLabels}) { return (        <aside className="config-panel"><div className="section-kicker"><Palette size={16}/><span>01 / {t.config}</span></div><h2>{t.config}</h2><p className="subtext">{t.configSub}</p>
          <div className="mode-toggle" role="group" aria-label={t.config}><button aria-pressed={!tri} className={!tri ? "selected" : ""} onClick={() => setTri(false)}><span className="single-icon"/>{t.single}</button><button aria-pressed={tri} className={tri ? "selected" : ""} onClick={() => setTri(true)}><span className="tri-icon"><i/><i/><i/></span>{t.tri}</button></div>
          <div className="color-fields">{(tri ? [0, 1, 2] : [0]).map(i => <ColorField key={i} value={colors[i]} label={tri ? [t.primary, t.secondary, t.tertiary][i] : t.source} t={t} onChange={value => setColor(i, value)}/>)}</div>
          <p className="seed-help">{tri ? t.triHelp : t.seedHelp}</p><button className="shuffle-button" onClick={surprise}><Shuffle size={15}/>{t.shuffle}</button>
          <ColorPresets colors={colors} applyColors={applyColors} t={t}/>
          <div className="config-note"><Sparkles size={17}/><div><strong>{t.note}</strong><p>{t.noteSub}</p></div></div>
        </aside>); }
