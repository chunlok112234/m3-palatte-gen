"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { ColorLabels } from "@/lib/color-labels";

export default function CopyColorButton({ value, disabled, label, t }: { value: string; disabled: boolean; label: string; t: ColorLabels }) {
  const [status, setStatus] = useState<"copied" | "failed" | null>(null);
  useEffect(() => { setStatus(null); }, [value, disabled]);
  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(null), 2500);
    return () => clearTimeout(timer);
  }, [status]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setStatus("copied"); }
    catch { setStatus("failed"); }
  };
  return <div className="copy-color-control">
    <button type="button" className="copy-color-button" disabled={disabled} aria-label={label} title={`${label}: ${value}`} onClick={copy}>{status === "copied" ? <Check size={14}/> : <Copy size={14}/>}</button>
    {status && <span className="copy-color-status" role="status">{t[status]}</span>}
  </div>;
}
