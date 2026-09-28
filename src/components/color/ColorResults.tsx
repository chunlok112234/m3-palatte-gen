"use client";
import { useState } from "react";
import { Layers3, Download, Palette, Table2, Copy, CheckCheck } from "lucide-react";
import type { ColorLabels, Lang } from "@/lib/color-labels";
import type { createPalette } from "@/lib/palette";
import TonalPalette from "./TonalPalette";
import ColorTokenTable from "./ColorTokenTable";
export default function ColorResults({result, t, lang, copy, copyTable, download}: {result: ReturnType<typeof createPalette>; t: ColorLabels; lang: Lang; copy: (value: string) => void; copyTable: (rich: boolean) => void; download: () => void}) { const [tab, setTab] = useState<"tonal" | "tokens">("tonal"); const rows = Object.keys(result.light); return (      <section className="results"><div className="results-heading"><div><div className="section-kicker"><Layers3 size={15}/><span>02 / {t.palette}</span></div><h2>{t.palette}</h2><p className="subtext">{t.paletteSub}</p></div><button className="download-button" onClick={download}><Download size={16}/>{t.css}<span>.css</span></button></div>
        <div className="result-card"><div className="result-toolbar"><div className="tabs" role="tablist" aria-label={t.palette}><button id="tonal-tab" role="tab" aria-selected={tab === "tonal"} aria-controls="tonal-panel" className={tab === "tonal" ? "active" : ""} onClick={() => setTab("tonal")}><Palette size={15}/>{t.tonal}</button><button id="tokens-tab" role="tab" aria-selected={tab === "tokens"} aria-controls="tokens-panel" className={tab === "tokens" ? "active" : ""} onClick={() => setTab("tokens")}><Table2 size={15}/>{t.tokens}<span>{rows.length}</span></button></div><span className="result-meta">{t.total}</span></div>
          {tab === "tonal" ? <TonalPalette result={result} t={t} copy={copy}/> : <ColorTokenTable result={result} t={t} lang={lang} copy={copy} copyTable={copyTable}/>}
        </div>
        {tab === "tonal" && <div className="export-line"><span><Table2 size={14}/>{t.tokenHelp}</span><div><button onClick={() => copyTable(false)}><Copy size={14}/>{t.markdown}</button><button onClick={() => copyTable(true)}><CheckCheck size={14}/>{t.rich}</button></div></div>}
      </section>); }
