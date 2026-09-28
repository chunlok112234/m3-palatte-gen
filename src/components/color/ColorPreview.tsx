"use client";
import { useState, type CSSProperties } from "react";
import { Moon, Sun, Sparkles, ArrowRight, Check, Plus } from "lucide-react";
import type { Scheme, ColorLabels } from "@/lib/color-labels";

export default function ColorPreview({ scheme, dark, t }: { scheme: Scheme; dark: boolean; t: ColorLabels }) {
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);
  return <div className="preview-panel" style={{ background: scheme.surface, color: scheme.onSurface, "--preview-primary": scheme.primary } as CSSProperties}>
    <div className="preview-label">{dark ? <Moon size={15} /> : <Sun size={15} />}<span>{dark ? t.dark : t.light}</span><span className="preview-label-right">{t.preview}</span></div>
    <div className="artwork" style={{ background: scheme.primaryContainer }} aria-hidden="true">
      <div className="art-grid" />
      <div className="art-orbit" style={{ borderColor: scheme.primary }} />
      <div className="art-circle" style={{ background: scheme.tertiaryContainer }} />
      <div className="art-arch" style={{ background: scheme.primary }} />
      <div className="art-block" style={{ background: scheme.secondary }} />
      <Sparkles className="art-spark" size={33} strokeWidth={1.1} style={{ color: scheme.onPrimaryContainer }} />
      <span className="art-caption" style={{ color: scheme.onPrimaryContainer }}>a little possibility.</span>
    </div>
    <div className="preview-content"><div className="inspiration" style={{ background: scheme.secondaryContainer, color: scheme.onSecondaryContainer }}><span />{t.chip}</div>
      <h3>{t.cardTitle}</h3><p style={{ color: scheme.onSurfaceVariant }}>{t.cardSub}</p>
      <div className="preview-actions"><button className="explore" style={{ background: scheme.primary, color: scheme.onPrimary }} onClick={() => setOpen(!open)}>{t.explore}<ArrowRight size={15}/></button><button className="save-button" aria-label={saved ? t.saved : t.save} aria-pressed={saved} onClick={() => setSaved(!saved)} style={{ borderColor: scheme.outlineVariant, color: scheme.primary }}>{saved ? <Check size={19}/> : <Plus size={19}/>}</button></div>
      {(open || saved) && <div className="collection" style={{ background: scheme.secondaryContainer, color: scheme.onSecondaryContainer }}><strong>{saved ? t.saved : t.collection}</strong><span>{t.items}</span></div>}
    </div>
    <div className="preview-swatches">{["primary", "secondary", "tertiary", "primaryContainer", "secondaryContainer", "tertiaryContainer"].map(key => <div key={key} style={{ background: scheme[key] }} />)}</div>
  </div>;
}

