"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Check, ChevronDown, Globe2, Layers3, Moon, Sun, X } from "lucide-react";
import { createPalette, exportCSS } from "@/lib/palette";
import { translations, humanize, roleNames, type Lang } from "@/lib/color-labels";
import { contrastText } from "@/lib/color";
import ColorControls from "@/components/color/ColorControls";
import ColorPreview from "@/components/color/ColorPreview";
import ColorResults from "@/components/color/ColorResults";

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const t = translations[lang];
  const [dark, setDark] = useState(false);
  const [tri, setTri] = useState(false);
  const [colors, setColors] = useState(["#52796F", "#8B74B4", "#D58D6E"]);
  const [toast, setToast] = useState("");
  const result = useMemo(() => createPalette(colors, tri), [colors, tri]);
  const active = dark ? result.dark : result.light;
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { if (toast) { const id = setTimeout(() => setToast(""), 3000); return () => clearTimeout(id); } }, [toast]);
  const applyColors = (next: string[]) => setColors(next);
  const setColor = (i: number, value: string) => setColors(current => current.map((color, index) => index === i ? value : color));
  const copy = async (value: string) => { try { await navigator.clipboard.writeText(value); setToast(t.copied); } catch { setToast(t.failed); } };
  const rows = Object.keys(result.light);
  const copyTable = async (rich: boolean) => {
    const label = (key: string) => lang === "en" ? humanize(key) : roleNames[key] || humanize(key);
    const markdown = `| ${t.role} | ${t.light} | ${t.dark} |\n| --- | --- | --- |\n` + rows.map(key => `| ${label(key)} | ${result.light[key]} | ${result.dark[key]} |`).join("\n");
    if (!rich) return copy(markdown);
    const cell = (color: string) => `<td style="background-color:${color};color:${contrastText(color)};padding:10px 16px;font-family:monospace">${color}</td>`;
    const html = `<table style="border-collapse:collapse;font-family:Arial,sans-serif"><thead><tr><th>${t.role}</th><th>${t.light}</th><th>${t.dark}</th></tr></thead><tbody>${rows.map(key => `<tr><td style="padding:10px 16px">${label(key)}</td>${cell(result.light[key])}${cell(result.dark[key])}</tr>`).join("")}</tbody></table>`;
    try { await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([markdown], { type: "text/plain" }) })]); setToast(t.copied); } catch { setToast(t.failed); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([exportCSS(result.light, result.dark)], { type: "text/css;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "m3-palettes.css"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setToast(t.downloaded);
  };
  const surprise = () => { applyColors(Array.from({length: 3}, () => `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0").toUpperCase()}`)); };
  const style = { "--accent": active.primary, "--accent-ink": active.onPrimary, "--accent-soft": active.primaryContainer, "--accent-soft-ink": active.onPrimaryContainer, "--dynamic-secondary": active.secondaryContainer } as CSSProperties;
  return <div className={`site ${dark ? "dark" : ""}`} style={style}>
    <header className="header"><a className="wordmark" href="#" aria-label="M3 Palettes home">M3<span className="logo-star">✳</span>Palettes<span className="logo-dot" /></a><div className="header-right"><span className="header-description">{t.nav}</span><div className="header-divider"/><div className="language-picker"><Globe2 size={15}/><select aria-label={t.language} value={lang} onChange={e => setLang(e.target.value as Lang)}><option value="en">English</option><option value="zh-Hant">繁體中文</option></select><ChevronDown size={13}/></div><button className="theme-button" aria-label={t.mode} onClick={() => setDark(!dark)}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button></div></header>
    <main>
      <section className="hero"><div className="eyebrow"><span/>{t.studio}</div><h1>{t.title1}<br/><span>{t.title2}</span></h1><p>{t.intro}<br/>{t.intro2}</p><div className="material-badge"><Layers3 size={14}/>{t.built}<span>↗</span></div><div className="hero-decoration" aria-hidden="true"><div className="decoration-circle"/><div className="decoration-square"/><span>✳</span></div><div className="hero-index">01 — ∞</div></section>
      <section className="workspace">
        <ColorControls tri={tri} setTri={setTri} colors={colors} setColor={setColor} applyColors={applyColors} surprise={surprise} t={t}/>
        <div className="preview-section"><div className="section-heading"><div><h2>{t.live}<span className="live-dot"/></h2><p className="subtext">{t.previewSub}</p></div><span className="tiny-label preview-system">MATERIAL 3 <span>↙</span></span></div><div className="previews"><ColorPreview scheme={result.light} dark={false} t={t}/><ColorPreview scheme={result.dark} dark={true} t={t}/></div></div>
      </section>
      <ColorResults result={result} t={t} lang={lang} copy={copy} copyTable={copyTable} download={download}/>
    </main><footer><a href="#" className="footer-logo">M3<span>✳</span>Palettes</a><p>{t.footer}</p><span>{t.footRight}<span className="footer-star">✳</span></span></footer>
    {toast && <div className="toast" role="status"><Check size={16}/>{toast}<button onClick={() => setToast("")} aria-label={t.close}><X size={15}/></button></div>}
  </div>;
}
