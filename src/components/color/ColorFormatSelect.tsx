import { ChevronDown } from "lucide-react";
import type { ColorFormat } from "@/lib/color";

export default function ColorFormatSelect({ value, label, onChange }: { value: ColorFormat; label: string; onChange: (value: ColorFormat) => void }) {
  return <div className="color-format"><select aria-label={label} value={value} onChange={event => onChange(event.target.value as ColorFormat)}>{["HEX", "RGB", "HSL", "HSV", "CMYK"].map(format => <option key={format}>{format}</option>)}</select><ChevronDown size={11} aria-hidden="true"/></div>;
}
