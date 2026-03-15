import { j as jsxRuntimeExports } from "./index-3JmW1yt2.js";
function FormError({ message }) {
  if (!message) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "p",
    {
      "data-ocid": "form.error_state",
      className: "mt-1 text-xs text-destructive",
      role: "alert",
      children: message
    }
  );
}
export {
  FormError as F
};
