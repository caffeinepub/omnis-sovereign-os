import { j as jsxRuntimeExports, D as Dialog, q as DialogContent, s as DialogHeader, t as DialogTitle, v as DialogDescription, w as DialogFooter, B as Button } from "./index-CnBkd1vF.js";
function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isOpen, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      "data-ocid": "confirm.dialog",
      className: "border-border bg-card text-card-foreground sm:max-w-md",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-heading text-foreground", children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-muted-foreground", children: description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              "data-ocid": "confirm.cancel_button",
              variant: "outline",
              className: "border-border text-foreground hover:bg-accent",
              onClick: onCancel,
              children: cancelLabel
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              "data-ocid": "confirm.confirm_button",
              variant: "destructive",
              onClick: onConfirm,
              children: confirmLabel
            }
          )
        ] })
      ]
    }
  ) });
}
export {
  ConfirmDialog as C
};
