"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowRight, Check, CheckCheck, ChevronDown, Code2, Copy, Download, Globe2, Layers3, Moon, Palette, Plus, Shuffle, Sparkles, Sun, Table2, X } from "lucide-react";
import { hexFromArgb } from "@material/material-color-utilities";
import { createPalette, exportCSS, kebab, tones } from "@/lib/palette";

type Scheme = Record<string, string>;
type Lang = "en" | "zh-Hant";
const translations = {
  en: {
    studio: "THE COLOR SYSTEM STUDIO", title1: "A little color.", title2: "A whole system.", intro: "Turn a color you love into a harmonious Material 3 palette.", intro2: "Made for your next great interface.", built: "Built on Material Design 3", config: "Make it yours", configSub: "A good palette starts with a little inspiration.", single: "Single color", tri: "Tri-color", source: "Source color", primary: "Primary", secondary: "Secondary", tertiary: "Tertiary", seedHelp: "Your starting point. We’ll find the harmony.", triHelp: "Three starting points. One expressive color system.", shuffle: "Surprise me", presets: "OR START WITH A MOOD", live: "Live preview", previewSub: "Same personality. Two sides.", light: "Light", dark: "Dark", preview: "PREVIEW", cardTitle: "Room for good things.", cardSub: "A fresh start for your next big idea.", explore: "Let’s explore", chip: "Your daily inspiration", saved: "Saved to your collection", save: "Save idea", collection: "Your collection", items: "A little inspiration, all in one place.", palette: "Your color system", paletteSub: "Thoughtfully generated. Ready to build with.", tonal: "Tonal palettes", tokens: "Color tokens", css: "Download CSS", markdown: "Copy Markdown", rich: "Copy rich text", role: "Color role", hex: "HEX", toneHelp: "Click any swatch to copy its hex value.", tokenHelp: "Semantic colors for every part of your interface.", footer: "A little tool for a more colorful internet.", footRight: "Crafted with Material 3 color science", copied: "Copied to clipboard", failed: "Clipboard unavailable. Please try in a secure browser context.", downloaded: "Your CSS is ready", invalid: "Enter a valid 6-digit hex color.", neutral: "Neutral", neutralVariant: "Neutral variant", error: "Error", total: "29 semantic tokens · 6 tonal palettes", note: "Good colors work together.", noteSub: "Every shade has a purpose. Each palette is generated in the HCT color space for perceptual harmony.", mint: "Fresh mint", violet: "Soft violet", blue: "Blue hour", peach: "Peach fuzz", rose: "Rose garden", olive: "Olive grove", mode: "Switch appearance", language: "Language", close: "Close", nav: "Palette generator", tag: "A SMALL SEED. ENDLESS POSSIBILITIES."
  },
  "zh-Hant": {
    studio: "你的色彩系統工作室", title1: "一點色彩，", title2: "完整系統。", intro: "將喜愛的顏色，化成和諧的 Material 3 色盤。", intro2: "為下一個出色的介面而設。", built: "採用 Material Design 3", config: "調出你的色彩", configSub: "好色盤，從一點靈感開始。", single: "單色模式", tri: "三色模式", source: "來源顏色", primary: "主色", secondary: "次色", tertiary: "第三色", seedHelp: "選一個起點，讓我們找到色彩的和諧。", triHelp: "三個色彩起點，一套富有表現力的系統。", shuffle: "給我驚喜", presets: "或從一種心情開始", live: "即時預覽", previewSub: "同一個性，兩種面貌。", light: "淺色", dark: "深色", preview: "元件預覽", cardTitle: "為美好留一點空間。", cardSub: "讓下一個大點子，有個全新的開始。", explore: "開始探索", chip: "每日靈感", saved: "已加入你的收藏", save: "收藏靈感", collection: "你的收藏", items: "把一點一滴的靈感，收藏在一起。", palette: "你的色彩系統", paletteSub: "精心生成，隨時用於創作。", tonal: "色調色盤", tokens: "色彩代碼", css: "下載 CSS", markdown: "複製 Markdown", rich: "複製富文字", role: "色彩角色", hex: "色碼", toneHelp: "點選任何色票，即可複製 HEX 色碼。", tokenHelp: "為介面每一個部分準備的語意色彩。", footer: "讓網絡多一點色彩的小工具。", footRight: "以 Material 3 色彩科學打造", copied: "已複製到剪貼簿", failed: "無法存取剪貼簿，請在安全的瀏覽器環境重試。", downloaded: "CSS 已準備好下載", invalid: "請輸入有效的六位 HEX 色碼。", neutral: "中性色", neutralVariant: "中性色變體", error: "錯誤色", total: "29 個語意色彩 · 6 組色調色盤", note: "好色彩，彼此呼應。", noteSub: "每個色階都有用途。所有色盤均以 HCT 色彩空間生成，呈現視覺上的和諧。", mint: "清新薄荷", violet: "柔和紫羅蘭", blue: "藍調時刻", peach: "柔嫩蜜桃", rose: "玫瑰花園", olive: "橄欖樹林", mode: "切換外觀", language: "語言", close: "關閉", nav: "色盤生成器", tag: "小小色彩種子，無限創作可能。"
  }
};
const moods = [ { color: "#52796F", key: "mint" }, { color: "#8B74B4", key: "violet" }, { color: "#507DA6", key: "blue" }, { color: "#D58D6E", key: "peach" }, { color: "#AD687C", key: "rose" }, { color: "#7A8052", key: "olive" } ] as const;
const roleNames: Record<string, string> = { primary: "主色", onPrimary: "主色上的內容", primaryContainer: "主色容器", onPrimaryContainer: "主色容器上的內容", secondary: "次色", onSecondary: "次色上的內容", secondaryContainer: "次色容器", onSecondaryContainer: "次色容器上的內容", tertiary: "第三色", onTertiary: "第三色上的內容", tertiaryContainer: "第三色容器", onTertiaryContainer: "第三色容器上的內容", error: "錯誤色", onError: "錯誤色上的內容", errorContainer: "錯誤色容器", onErrorContainer: "錯誤色容器上的內容", background: "背景", onBackground: "背景上的內容", surface: "表面", onSurface: "表面上的內容", surfaceVariant: "表面變體", onSurfaceVariant: "表面變體上的內容", outline: "外框", outlineVariant: "外框變體", shadow: "陰影", scrim: "遮罩", inverseSurface: "反向表面", inverseOnSurface: "反向表面上的內容", inversePrimary: "反向主色" };
const humanize = (s: string) => s.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());

function Preview({ scheme, dark, t }: { scheme: Scheme; dark: boolean; t: typeof translations.en }) {
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

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const t = translations[lang];
  const [dark, setDark] = useState(false);
  const [tri, setTri] = useState(false);
  const [colors, setColors] = useState(["#52796F", "#8B74B4", "#D58D6E"]);
  const [drafts, setDrafts] = useState(colors);
  const [errors, setErrors] = useState<boolean[]>([]);
  const [tab, setTab] = useState<"tonal" | "tokens">("tonal");
  const [toast, setToast] = useState("");
  const result = useMemo(() => createPalette(colors, tri), [colors, tri]);
  const active = dark ? result.dark : result.light;
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { if (toast) { const id = setTimeout(() => setToast(""), 3000); return () => clearTimeout(id); } }, [toast]);
  const applyColors = (next: string[]) => { setColors(next); setDrafts(next); setErrors([]); };
  const setColor = (i: number, value: string) => {
    setDrafts(d => d.map((c, index) => index === i ? value : c));
    const normalized = value.startsWith("#") ? value : `#${value}`;
    const valid = /^#[0-9a-f]{6}$/i.test(normalized);
    setErrors(e => { const next = [...e]; next[i] = !valid; return next; });
    if (valid) setColors(c => c.map((color, index) => index === i ? normalized.toUpperCase() : color));
  };
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
        <aside className="config-panel"><div className="section-kicker"><Palette size={16}/><span>01 / {t.config}</span></div><h2>{t.config}</h2><p className="subtext">{t.configSub}</p>
          <div className="mode-toggle" role="group" aria-label={t.config}><button aria-pressed={!tri} className={!tri ? "selected" : ""} onClick={() => setTri(false)}><span className="single-icon"/>{t.single}</button><button aria-pressed={tri} className={tri ? "selected" : ""} onClick={() => setTri(true)}><span className="tri-icon"><i/><i/><i/></span>{t.tri}</button></div>
          <div className="color-fields">{(tri ? [0, 1, 2] : [0]).map(i => <div className="color-field" key={i}><label htmlFor={`hex-${i}`}>{tri ? [t.primary, t.secondary, t.tertiary][i] : t.source}</label><div className={`color-input ${errors[i] ? "invalid" : ""}`}><div className="color-picker" style={{ background: colors[i] }}><input aria-label={`${tri ? [t.primary, t.secondary, t.tertiary][i] : t.source} ${t.hex}`} type="color" value={colors[i]} onChange={e => setColor(i, e.target.value)} /></div><input id={`hex-${i}`} value={drafts[i]} maxLength={7} aria-invalid={!!errors[i]} aria-describedby={errors[i] ? `error-${i}` : undefined} onChange={e => setColor(i, e.target.value)} spellCheck={false}/><span>HEX</span></div>{errors[i] && <span className="error-text" id={`error-${i}`}>{t.invalid}</span>}</div>)}</div>
          <p className="seed-help">{tri ? t.triHelp : t.seedHelp}</p><button className="shuffle-button" onClick={surprise}><Shuffle size={15}/>{t.shuffle}</button>
          <div className="mood-section"><span className="tiny-label">{t.presets}</span><div className="moods">{moods.map(mood => <button key={mood.key} title={t[mood.key]} aria-label={t[mood.key]} aria-pressed={colors[0] === mood.color} className={colors[0] === mood.color ? "active" : ""} style={{ "--mood": mood.color } as CSSProperties} onClick={() => applyColors([mood.color, colors[1], colors[2]])}>{colors[0] === mood.color && <Check size={16}/>}</button>)}</div><div className="mood-labels"><span>{t.mint}</span><span>{t.olive}</span></div></div>
          <div className="config-note"><Sparkles size={17}/><div><strong>{t.note}</strong><p>{t.noteSub}</p></div></div>
        </aside>
        <div className="preview-section"><div className="section-heading"><div><h2>{t.live}<span className="live-dot"/></h2><p className="subtext">{t.previewSub}</p></div><span className="tiny-label preview-system">MATERIAL 3 <span>↙</span></span></div><div className="previews"><Preview scheme={result.light} dark={false} t={t}/><Preview scheme={result.dark} dark={true} t={t}/></div></div>
      </section>
      <section className="results"><div className="results-heading"><div><div className="section-kicker"><Layers3 size={15}/><span>02 / {t.palette}</span></div><h2>{t.palette}</h2><p className="subtext">{t.paletteSub}</p></div><button className="download-button" onClick={download}><Download size={16}/>{t.css}<span>.css</span></button></div>
        <div className="result-card"><div className="result-toolbar"><div className="tabs" role="tablist" aria-label={t.palette}><button id="tonal-tab" role="tab" aria-selected={tab === "tonal"} aria-controls="tonal-panel" className={tab === "tonal" ? "active" : ""} onClick={() => setTab("tonal")}><Palette size={15}/>{t.tonal}</button><button id="tokens-tab" role="tab" aria-selected={tab === "tokens"} aria-controls="tokens-panel" className={tab === "tokens" ? "active" : ""} onClick={() => setTab("tokens")}><Table2 size={15}/>{t.tokens}<span>{rows.length}</span></button></div><span className="result-meta">{t.total}</span></div>
          {tab === "tonal" ? <div className="tonal-content" role="tabpanel" id="tonal-panel" aria-labelledby="tonal-tab"><div className="tonal-top"><span>{t.toneHelp}</span><span>HCT <ArrowDown size={12}/></span></div><div className="tonal-scroll"><div className="tone-grid"><div className="tone-header"><span/>{tones.map(tone => <span key={tone}>{tone}</span>)}</div>{Object.entries(result.palettes).map(([name, palette]) => <div className="tone-row" key={name}><span className="tone-name">{t[name as keyof typeof t] || humanize(name)}</span>{tones.map(tone => { const hex = hexFromArgb(palette.tone(tone)).toUpperCase(); return <button key={tone} style={{ background: hex, color: contrastText(hex) }} title={`${humanize(name)} ${tone} · ${hex}`} aria-label={`${humanize(name)} ${tone}: ${hex}`} onClick={() => copy(hex)}><span>{tone}</span><Copy size={13}/></button>; })}</div>)}</div></div><div className="tonal-bottom"><span><span className="small-dot"/>{t.tag}</span><Code2 size={15}/></div></div> : <div className="token-content" role="tabpanel" id="tokens-panel" aria-labelledby="tokens-tab"><div className="table-actions"><span>{t.tokenHelp}</span><div><button onClick={() => copyTable(false)}><Copy size={14}/>{t.markdown}</button><button onClick={() => copyTable(true)}><CheckCheck size={14}/>{t.rich}</button></div></div><div className="table-scroll"><table><thead><tr><th>{t.role}</th><th><Sun size={13}/>{t.light}</th><th><Moon size={13}/>{t.dark}</th></tr></thead><tbody>{rows.map(key => <tr key={key}><td><strong>{lang === "en" ? humanize(key) : roleNames[key]}</strong><code>--md-sys-color-{kebab(key)}</code></td>{[result.light, result.dark].map((scheme, i) => <td key={i}><button className="token-color" onClick={() => copy(scheme[key])} aria-label={`${humanize(key)} ${i ? t.dark : t.light}: ${scheme[key]}`}><span style={{ background: scheme[key] }}/><code>{scheme[key]}</code><Copy size={12}/></button></td>)}</tr>)}</tbody></table></div></div>}
        </div>
        {tab === "tonal" && <div className="export-line"><span><Table2 size={14}/>{t.tokenHelp}</span><div><button onClick={() => copyTable(false)}><Copy size={14}/>{t.markdown}</button><button onClick={() => copyTable(true)}><CheckCheck size={14}/>{t.rich}</button></div></div>}
      </section>
    </main><footer><a href="#" className="footer-logo">M3<span>✳</span>Palettes</a><p>{t.footer}</p><span>{t.footRight}<span className="footer-star">✳</span></span></footer>
    {toast && <div className="toast" role="status"><Check size={16}/>{toast}<button onClick={() => setToast("")} aria-label={t.close}><X size={15}/></button></div>}
  </div>;
}

function contrastText(hex: string) {
  const values = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722 > 0.179 ? "#17211E" : "#FFFFFF";
}
