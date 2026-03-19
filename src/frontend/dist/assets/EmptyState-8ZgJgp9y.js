import { j as jsxRuntimeExports, e as cn } from "./index-Nuoc5gUR.js";
function EmptyState({
  icon,
  message,
  className,
  ocid,
  id
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": ocid ?? id ?? "empty_state.panel",
      className: cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center opacity-40", children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium tracking-wide uppercase opacity-60", children: message })
      ]
    }
  );
}
export {
  EmptyState as E
};
