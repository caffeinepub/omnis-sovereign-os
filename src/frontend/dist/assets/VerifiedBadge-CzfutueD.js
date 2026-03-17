import { j as jsxRuntimeExports, e as cn } from "./index-CnBkd1vF.js";
import { C as CLEARANCE_LABELS, a as CLEARANCE_COLORS } from "./constants-O6cGduIW.js";
import { S as ShieldCheck } from "./shield-check-D4WrqZ7-.js";
const COLOR_CLASSES = {
  gray: "bg-zinc-700/60 text-zinc-300 border-zinc-600",
  green: "bg-green-900/60 text-green-300 border-green-700",
  blue: "bg-blue-900/60 text-blue-300 border-blue-700",
  orange: "bg-orange-900/60 text-orange-300 border-orange-700",
  red: "bg-red-900/60 text-red-300 border-red-700"
};
function ClearanceBadge({ level, className }) {
  const color = CLEARANCE_COLORS[level] ?? "gray";
  const label = CLEARANCE_LABELS[level] ?? "Unknown";
  const colorClass = COLOR_CLASSES[color] ?? COLOR_CLASSES.gray;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      "data-ocid": "clearance.badge",
      className: cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        colorClass,
        className
      ),
      children: label
    }
  );
}
function VerifiedBadge({ "data-ocid": dataOcid }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      "data-ocid": dataOcid,
      className: "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
      style: {
        backgroundColor: "rgba(245, 158, 11, 0.08)",
        borderColor: "rgba(245, 158, 11, 0.3)",
        color: "#f59e0b"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-2.5 w-2.5" }),
        "Verified"
      ]
    }
  );
}
export {
  ClearanceBadge as C,
  VerifiedBadge as V
};
