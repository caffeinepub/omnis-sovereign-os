import { f as createLucideIcon, r as reactExports, A as createDialogScope, j as jsxRuntimeExports, E as Root, G as useComposedRefs, W as WarningProvider, H as createContextScope, I as Content, J as composeEventHandlers, K as createSlottable, T as Title, N as Description, O as Close, P as Portal$1, Q as Overlay, V as Trigger$1, e as cn, Y as buttonVariants, Z as useId, _ as useControllableState, $ as Primitive, a0 as Presence, a1 as Portal$2, a2 as DismissableLayer, c as useExtActor, h as usePermissions, a as useInternetIdentity, b as useNavigate, a3 as useQuery, L as Link, i as Users, a4 as useQueryClient, D as Dialog, q as DialogContent, s as DialogHeader, t as DialogTitle, w as DialogFooter, B as Button, p as ue } from "./index-Nuoc5gUR.js";
import { T as TopNav, E as ExternalLink, u as useMutation, L as Lock } from "./TopNav-BtVzy2ke.js";
import { V as VerifiedBadge, C as ClearanceBadge } from "./VerifiedBadge-DPacCx-N.js";
import { F as FormError } from "./FormError-D8yaafrz.js";
import { g as createPopperScope, h as Root2$1, A as Anchor, i as Arrow, j as Content$1, k as Root$1, I as Input, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, L as Label, p as parseDisplayName, f as formatDisplayName, R as RankSelector } from "./displayName-mUntZQpD.js";
import { S as SkeletonCard } from "./SkeletonCard-CC6UtAHp.js";
import { B as Breadcrumb, a as BreadcrumbList, b as BreadcrumbItem, c as BreadcrumbLink, d as BreadcrumbSeparator, e as BreadcrumbPage } from "./breadcrumb-DKlcFZL-.js";
import { S as Switch } from "./switch-Bacar9H2.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CMPl5W90.js";
import { C as CLEARANCE_LABELS } from "./constants-O6cGduIW.js";
import { S as ShieldCheck } from "./shield-check-9efrvzwA.js";
import { C as Clock } from "./clock-B7BVE7B4.js";
import { L as LoaderCircle } from "./loader-circle-BnPM08q-.js";
import "./check-cDSKCr7b.js";
import "./chevron-right-Cauoz1NP.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
const Pencil = createLucideIcon("pencil", __iconNode);
var ROOT_NAME = "AlertDialog";
var [createAlertDialogContext] = createContextScope(ROOT_NAME, [
  createDialogScope
]);
var useDialogScope = createDialogScope();
var AlertDialog$1 = (props) => {
  const { __scopeAlertDialog, ...alertDialogProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { ...dialogScope, ...alertDialogProps, modal: true });
};
AlertDialog$1.displayName = ROOT_NAME;
var TRIGGER_NAME$1 = "AlertDialogTrigger";
var AlertDialogTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...triggerProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Trigger$1, { ...dialogScope, ...triggerProps, ref: forwardedRef });
  }
);
AlertDialogTrigger.displayName = TRIGGER_NAME$1;
var PORTAL_NAME$1 = "AlertDialogPortal";
var AlertDialogPortal$1 = (props) => {
  const { __scopeAlertDialog, ...portalProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$1, { ...dialogScope, ...portalProps });
};
AlertDialogPortal$1.displayName = PORTAL_NAME$1;
var OVERLAY_NAME = "AlertDialogOverlay";
var AlertDialogOverlay$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...overlayProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Overlay, { ...dialogScope, ...overlayProps, ref: forwardedRef });
  }
);
AlertDialogOverlay$1.displayName = OVERLAY_NAME;
var CONTENT_NAME$1 = "AlertDialogContent";
var [AlertDialogContentProvider, useAlertDialogContentContext] = createAlertDialogContext(CONTENT_NAME$1);
var Slottable$1 = createSlottable("AlertDialogContent");
var AlertDialogContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, children, ...contentProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    const cancelRef = reactExports.useRef(null);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      WarningProvider,
      {
        contentName: CONTENT_NAME$1,
        titleName: TITLE_NAME,
        docsSlug: "alert-dialog",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogContentProvider, { scope: __scopeAlertDialog, cancelRef, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Content,
          {
            role: "alertdialog",
            ...dialogScope,
            ...contentProps,
            ref: composedRefs,
            onOpenAutoFocus: composeEventHandlers(contentProps.onOpenAutoFocus, (event) => {
              var _a;
              event.preventDefault();
              (_a = cancelRef.current) == null ? void 0 : _a.focus({ preventScroll: true });
            }),
            onPointerDownOutside: (event) => event.preventDefault(),
            onInteractOutside: (event) => event.preventDefault(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Slottable$1, { children }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DescriptionWarning, { contentRef })
            ]
          }
        ) })
      }
    );
  }
);
AlertDialogContent$1.displayName = CONTENT_NAME$1;
var TITLE_NAME = "AlertDialogTitle";
var AlertDialogTitle$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...titleProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Title, { ...dialogScope, ...titleProps, ref: forwardedRef });
  }
);
AlertDialogTitle$1.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "AlertDialogDescription";
var AlertDialogDescription$1 = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeAlertDialog, ...descriptionProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Description, { ...dialogScope, ...descriptionProps, ref: forwardedRef });
});
AlertDialogDescription$1.displayName = DESCRIPTION_NAME;
var ACTION_NAME = "AlertDialogAction";
var AlertDialogAction$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...actionProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Close, { ...dialogScope, ...actionProps, ref: forwardedRef });
  }
);
AlertDialogAction$1.displayName = ACTION_NAME;
var CANCEL_NAME = "AlertDialogCancel";
var AlertDialogCancel$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...cancelProps } = props;
    const { cancelRef } = useAlertDialogContentContext(CANCEL_NAME, __scopeAlertDialog);
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const ref = useComposedRefs(forwardedRef, cancelRef);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Close, { ...dialogScope, ...cancelProps, ref });
  }
);
AlertDialogCancel$1.displayName = CANCEL_NAME;
var DescriptionWarning = ({ contentRef }) => {
  const MESSAGE = `\`${CONTENT_NAME$1}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${CONTENT_NAME$1}\` by passing a \`${DESCRIPTION_NAME}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${CONTENT_NAME$1}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;
  reactExports.useEffect(() => {
    var _a;
    const hasDescription = document.getElementById(
      (_a = contentRef.current) == null ? void 0 : _a.getAttribute("aria-describedby")
    );
    if (!hasDescription) console.warn(MESSAGE);
  }, [MESSAGE, contentRef]);
  return null;
};
var Root2 = AlertDialog$1;
var Portal2 = AlertDialogPortal$1;
var Overlay2 = AlertDialogOverlay$1;
var Content2$1 = AlertDialogContent$1;
var Action = AlertDialogAction$1;
var Cancel = AlertDialogCancel$1;
var Title2 = AlertDialogTitle$1;
var Description2 = AlertDialogDescription$1;
function AlertDialog({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root2, { "data-slot": "alert-dialog", ...props });
}
function AlertDialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Portal2, { "data-slot": "alert-dialog-portal", ...props });
}
function AlertDialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Overlay2,
    {
      "data-slot": "alert-dialog-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function AlertDialogContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogPortal, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogOverlay, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Content2$1,
      {
        "data-slot": "alert-dialog-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        ),
        ...props
      }
    )
  ] });
}
function AlertDialogHeader({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "alert-dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function AlertDialogFooter({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "alert-dialog-footer",
      className: cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      ),
      ...props
    }
  );
}
function AlertDialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Title2,
    {
      "data-slot": "alert-dialog-title",
      className: cn("text-lg font-semibold", className),
      ...props
    }
  );
}
function AlertDialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Description2,
    {
      "data-slot": "alert-dialog-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function AlertDialogAction({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Action,
    {
      className: cn(buttonVariants(), className),
      ...props
    }
  );
}
function AlertDialogCancel({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Cancel,
    {
      className: cn(buttonVariants({ variant: "outline" }), className),
      ...props
    }
  );
}
var [createTooltipContext] = createContextScope("Tooltip", [
  createPopperScope
]);
var usePopperScope = createPopperScope();
var PROVIDER_NAME = "TooltipProvider";
var DEFAULT_DELAY_DURATION = 700;
var TOOLTIP_OPEN = "tooltip.open";
var [TooltipProviderContextProvider, useTooltipProviderContext] = createTooltipContext(PROVIDER_NAME);
var TooltipProvider$1 = (props) => {
  const {
    __scopeTooltip,
    delayDuration = DEFAULT_DELAY_DURATION,
    skipDelayDuration = 300,
    disableHoverableContent = false,
    children
  } = props;
  const isOpenDelayedRef = reactExports.useRef(true);
  const isPointerInTransitRef = reactExports.useRef(false);
  const skipDelayTimerRef = reactExports.useRef(0);
  reactExports.useEffect(() => {
    const skipDelayTimer = skipDelayTimerRef.current;
    return () => window.clearTimeout(skipDelayTimer);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    TooltipProviderContextProvider,
    {
      scope: __scopeTooltip,
      isOpenDelayedRef,
      delayDuration,
      onOpen: reactExports.useCallback(() => {
        window.clearTimeout(skipDelayTimerRef.current);
        isOpenDelayedRef.current = false;
      }, []),
      onClose: reactExports.useCallback(() => {
        window.clearTimeout(skipDelayTimerRef.current);
        skipDelayTimerRef.current = window.setTimeout(
          () => isOpenDelayedRef.current = true,
          skipDelayDuration
        );
      }, [skipDelayDuration]),
      isPointerInTransitRef,
      onPointerInTransitChange: reactExports.useCallback((inTransit) => {
        isPointerInTransitRef.current = inTransit;
      }, []),
      disableHoverableContent,
      children
    }
  );
};
TooltipProvider$1.displayName = PROVIDER_NAME;
var TOOLTIP_NAME = "Tooltip";
var [TooltipContextProvider, useTooltipContext] = createTooltipContext(TOOLTIP_NAME);
var Tooltip$1 = (props) => {
  const {
    __scopeTooltip,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    disableHoverableContent: disableHoverableContentProp,
    delayDuration: delayDurationProp
  } = props;
  const providerContext = useTooltipProviderContext(TOOLTIP_NAME, props.__scopeTooltip);
  const popperScope = usePopperScope(__scopeTooltip);
  const [trigger, setTrigger] = reactExports.useState(null);
  const contentId = useId();
  const openTimerRef = reactExports.useRef(0);
  const disableHoverableContent = disableHoverableContentProp ?? providerContext.disableHoverableContent;
  const delayDuration = delayDurationProp ?? providerContext.delayDuration;
  const wasOpenDelayedRef = reactExports.useRef(false);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: (open2) => {
      if (open2) {
        providerContext.onOpen();
        document.dispatchEvent(new CustomEvent(TOOLTIP_OPEN));
      } else {
        providerContext.onClose();
      }
      onOpenChange == null ? void 0 : onOpenChange(open2);
    },
    caller: TOOLTIP_NAME
  });
  const stateAttribute = reactExports.useMemo(() => {
    return open ? wasOpenDelayedRef.current ? "delayed-open" : "instant-open" : "closed";
  }, [open]);
  const handleOpen = reactExports.useCallback(() => {
    window.clearTimeout(openTimerRef.current);
    openTimerRef.current = 0;
    wasOpenDelayedRef.current = false;
    setOpen(true);
  }, [setOpen]);
  const handleClose = reactExports.useCallback(() => {
    window.clearTimeout(openTimerRef.current);
    openTimerRef.current = 0;
    setOpen(false);
  }, [setOpen]);
  const handleDelayedOpen = reactExports.useCallback(() => {
    window.clearTimeout(openTimerRef.current);
    openTimerRef.current = window.setTimeout(() => {
      wasOpenDelayedRef.current = true;
      setOpen(true);
      openTimerRef.current = 0;
    }, delayDuration);
  }, [delayDuration, setOpen]);
  reactExports.useEffect(() => {
    return () => {
      if (openTimerRef.current) {
        window.clearTimeout(openTimerRef.current);
        openTimerRef.current = 0;
      }
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root2$1, { ...popperScope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    TooltipContextProvider,
    {
      scope: __scopeTooltip,
      contentId,
      open,
      stateAttribute,
      trigger,
      onTriggerChange: setTrigger,
      onTriggerEnter: reactExports.useCallback(() => {
        if (providerContext.isOpenDelayedRef.current) handleDelayedOpen();
        else handleOpen();
      }, [providerContext.isOpenDelayedRef, handleDelayedOpen, handleOpen]),
      onTriggerLeave: reactExports.useCallback(() => {
        if (disableHoverableContent) {
          handleClose();
        } else {
          window.clearTimeout(openTimerRef.current);
          openTimerRef.current = 0;
        }
      }, [handleClose, disableHoverableContent]),
      onOpen: handleOpen,
      onClose: handleClose,
      disableHoverableContent,
      children
    }
  ) });
};
Tooltip$1.displayName = TOOLTIP_NAME;
var TRIGGER_NAME = "TooltipTrigger";
var TooltipTrigger$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTooltip, ...triggerProps } = props;
    const context = useTooltipContext(TRIGGER_NAME, __scopeTooltip);
    const providerContext = useTooltipProviderContext(TRIGGER_NAME, __scopeTooltip);
    const popperScope = usePopperScope(__scopeTooltip);
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref, context.onTriggerChange);
    const isPointerDownRef = reactExports.useRef(false);
    const hasPointerMoveOpenedRef = reactExports.useRef(false);
    const handlePointerUp = reactExports.useCallback(() => isPointerDownRef.current = false, []);
    reactExports.useEffect(() => {
      return () => document.removeEventListener("pointerup", handlePointerUp);
    }, [handlePointerUp]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Anchor, { asChild: true, ...popperScope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        "aria-describedby": context.open ? context.contentId : void 0,
        "data-state": context.stateAttribute,
        ...triggerProps,
        ref: composedRefs,
        onPointerMove: composeEventHandlers(props.onPointerMove, (event) => {
          if (event.pointerType === "touch") return;
          if (!hasPointerMoveOpenedRef.current && !providerContext.isPointerInTransitRef.current) {
            context.onTriggerEnter();
            hasPointerMoveOpenedRef.current = true;
          }
        }),
        onPointerLeave: composeEventHandlers(props.onPointerLeave, () => {
          context.onTriggerLeave();
          hasPointerMoveOpenedRef.current = false;
        }),
        onPointerDown: composeEventHandlers(props.onPointerDown, () => {
          if (context.open) {
            context.onClose();
          }
          isPointerDownRef.current = true;
          document.addEventListener("pointerup", handlePointerUp, { once: true });
        }),
        onFocus: composeEventHandlers(props.onFocus, () => {
          if (!isPointerDownRef.current) context.onOpen();
        }),
        onBlur: composeEventHandlers(props.onBlur, context.onClose),
        onClick: composeEventHandlers(props.onClick, context.onClose)
      }
    ) });
  }
);
TooltipTrigger$1.displayName = TRIGGER_NAME;
var PORTAL_NAME = "TooltipPortal";
var [PortalProvider, usePortalContext] = createTooltipContext(PORTAL_NAME, {
  forceMount: void 0
});
var TooltipPortal = (props) => {
  const { __scopeTooltip, forceMount, children, container } = props;
  const context = useTooltipContext(PORTAL_NAME, __scopeTooltip);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PortalProvider, { scope: __scopeTooltip, forceMount, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$2, { asChild: true, container, children }) }) });
};
TooltipPortal.displayName = PORTAL_NAME;
var CONTENT_NAME = "TooltipContent";
var TooltipContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeTooltip);
    const { forceMount = portalContext.forceMount, side = "top", ...contentProps } = props;
    const context = useTooltipContext(CONTENT_NAME, props.__scopeTooltip);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: context.disableHoverableContent ? /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContentImpl, { side, ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContentHoverable, { side, ...contentProps, ref: forwardedRef }) });
  }
);
var TooltipContentHoverable = reactExports.forwardRef((props, forwardedRef) => {
  const context = useTooltipContext(CONTENT_NAME, props.__scopeTooltip);
  const providerContext = useTooltipProviderContext(CONTENT_NAME, props.__scopeTooltip);
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const [pointerGraceArea, setPointerGraceArea] = reactExports.useState(null);
  const { trigger, onClose } = context;
  const content = ref.current;
  const { onPointerInTransitChange } = providerContext;
  const handleRemoveGraceArea = reactExports.useCallback(() => {
    setPointerGraceArea(null);
    onPointerInTransitChange(false);
  }, [onPointerInTransitChange]);
  const handleCreateGraceArea = reactExports.useCallback(
    (event, hoverTarget) => {
      const currentTarget = event.currentTarget;
      const exitPoint = { x: event.clientX, y: event.clientY };
      const exitSide = getExitSideFromRect(exitPoint, currentTarget.getBoundingClientRect());
      const paddedExitPoints = getPaddedExitPoints(exitPoint, exitSide);
      const hoverTargetPoints = getPointsFromRect(hoverTarget.getBoundingClientRect());
      const graceArea = getHull([...paddedExitPoints, ...hoverTargetPoints]);
      setPointerGraceArea(graceArea);
      onPointerInTransitChange(true);
    },
    [onPointerInTransitChange]
  );
  reactExports.useEffect(() => {
    return () => handleRemoveGraceArea();
  }, [handleRemoveGraceArea]);
  reactExports.useEffect(() => {
    if (trigger && content) {
      const handleTriggerLeave = (event) => handleCreateGraceArea(event, content);
      const handleContentLeave = (event) => handleCreateGraceArea(event, trigger);
      trigger.addEventListener("pointerleave", handleTriggerLeave);
      content.addEventListener("pointerleave", handleContentLeave);
      return () => {
        trigger.removeEventListener("pointerleave", handleTriggerLeave);
        content.removeEventListener("pointerleave", handleContentLeave);
      };
    }
  }, [trigger, content, handleCreateGraceArea, handleRemoveGraceArea]);
  reactExports.useEffect(() => {
    if (pointerGraceArea) {
      const handleTrackPointerGrace = (event) => {
        const target = event.target;
        const pointerPosition = { x: event.clientX, y: event.clientY };
        const hasEnteredTarget = (trigger == null ? void 0 : trigger.contains(target)) || (content == null ? void 0 : content.contains(target));
        const isPointerOutsideGraceArea = !isPointInPolygon(pointerPosition, pointerGraceArea);
        if (hasEnteredTarget) {
          handleRemoveGraceArea();
        } else if (isPointerOutsideGraceArea) {
          handleRemoveGraceArea();
          onClose();
        }
      };
      document.addEventListener("pointermove", handleTrackPointerGrace);
      return () => document.removeEventListener("pointermove", handleTrackPointerGrace);
    }
  }, [trigger, content, pointerGraceArea, onClose, handleRemoveGraceArea]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContentImpl, { ...props, ref: composedRefs });
});
var [VisuallyHiddenContentContextProvider, useVisuallyHiddenContentContext] = createTooltipContext(TOOLTIP_NAME, { isInside: false });
var Slottable = createSlottable("TooltipContent");
var TooltipContentImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeTooltip,
      children,
      "aria-label": ariaLabel,
      onEscapeKeyDown,
      onPointerDownOutside,
      ...contentProps
    } = props;
    const context = useTooltipContext(CONTENT_NAME, __scopeTooltip);
    const popperScope = usePopperScope(__scopeTooltip);
    const { onClose } = context;
    reactExports.useEffect(() => {
      document.addEventListener(TOOLTIP_OPEN, onClose);
      return () => document.removeEventListener(TOOLTIP_OPEN, onClose);
    }, [onClose]);
    reactExports.useEffect(() => {
      if (context.trigger) {
        const handleScroll = (event) => {
          const target = event.target;
          if (target == null ? void 0 : target.contains(context.trigger)) onClose();
        };
        window.addEventListener("scroll", handleScroll, { capture: true });
        return () => window.removeEventListener("scroll", handleScroll, { capture: true });
      }
    }, [context.trigger, onClose]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      DismissableLayer,
      {
        asChild: true,
        disableOutsidePointerEvents: false,
        onEscapeKeyDown,
        onPointerDownOutside,
        onFocusOutside: (event) => event.preventDefault(),
        onDismiss: onClose,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Content$1,
          {
            "data-state": context.stateAttribute,
            ...popperScope,
            ...contentProps,
            ref: forwardedRef,
            style: {
              ...contentProps.style,
              // re-namespace exposed content custom properties
              ...{
                "--radix-tooltip-content-transform-origin": "var(--radix-popper-transform-origin)",
                "--radix-tooltip-content-available-width": "var(--radix-popper-available-width)",
                "--radix-tooltip-content-available-height": "var(--radix-popper-available-height)",
                "--radix-tooltip-trigger-width": "var(--radix-popper-anchor-width)",
                "--radix-tooltip-trigger-height": "var(--radix-popper-anchor-height)"
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Slottable, { children }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(VisuallyHiddenContentContextProvider, { scope: __scopeTooltip, isInside: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Root$1, { id: context.contentId, role: "tooltip", children: ariaLabel || children }) })
            ]
          }
        )
      }
    );
  }
);
TooltipContent$1.displayName = CONTENT_NAME;
var ARROW_NAME = "TooltipArrow";
var TooltipArrow = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTooltip, ...arrowProps } = props;
    const popperScope = usePopperScope(__scopeTooltip);
    const visuallyHiddenContentContext = useVisuallyHiddenContentContext(
      ARROW_NAME,
      __scopeTooltip
    );
    return visuallyHiddenContentContext.isInside ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(Arrow, { ...popperScope, ...arrowProps, ref: forwardedRef });
  }
);
TooltipArrow.displayName = ARROW_NAME;
function getExitSideFromRect(point, rect) {
  const top = Math.abs(rect.top - point.y);
  const bottom = Math.abs(rect.bottom - point.y);
  const right = Math.abs(rect.right - point.x);
  const left = Math.abs(rect.left - point.x);
  switch (Math.min(top, bottom, right, left)) {
    case left:
      return "left";
    case right:
      return "right";
    case top:
      return "top";
    case bottom:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}
function getPaddedExitPoints(exitPoint, exitSide, padding = 5) {
  const paddedExitPoints = [];
  switch (exitSide) {
    case "top":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y + padding },
        { x: exitPoint.x + padding, y: exitPoint.y + padding }
      );
      break;
    case "bottom":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y - padding },
        { x: exitPoint.x + padding, y: exitPoint.y - padding }
      );
      break;
    case "left":
      paddedExitPoints.push(
        { x: exitPoint.x + padding, y: exitPoint.y - padding },
        { x: exitPoint.x + padding, y: exitPoint.y + padding }
      );
      break;
    case "right":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y - padding },
        { x: exitPoint.x - padding, y: exitPoint.y + padding }
      );
      break;
  }
  return paddedExitPoints;
}
function getPointsFromRect(rect) {
  const { top, right, bottom, left } = rect;
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom }
  ];
}
function isPointInPolygon(point, polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const ii = polygon[i];
    const jj = polygon[j];
    const xi = ii.x;
    const yi = ii.y;
    const xj = jj.x;
    const yj = jj.y;
    const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
function getHull(points) {
  const newPoints = points.slice();
  newPoints.sort((a, b) => {
    if (a.x < b.x) return -1;
    else if (a.x > b.x) return 1;
    else if (a.y < b.y) return -1;
    else if (a.y > b.y) return 1;
    else return 0;
  });
  return getHullPresorted(newPoints);
}
function getHullPresorted(points) {
  if (points.length <= 1) return points.slice();
  const upperHull = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    while (upperHull.length >= 2) {
      const q = upperHull[upperHull.length - 1];
      const r = upperHull[upperHull.length - 2];
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) upperHull.pop();
      else break;
    }
    upperHull.push(p);
  }
  upperHull.pop();
  const lowerHull = [];
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (lowerHull.length >= 2) {
      const q = lowerHull[lowerHull.length - 1];
      const r = lowerHull[lowerHull.length - 2];
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) lowerHull.pop();
      else break;
    }
    lowerHull.push(p);
  }
  lowerHull.pop();
  if (upperHull.length === 1 && lowerHull.length === 1 && upperHull[0].x === lowerHull[0].x && upperHull[0].y === lowerHull[0].y) {
    return upperHull;
  } else {
    return upperHull.concat(lowerHull);
  }
}
var Provider = TooltipProvider$1;
var Root3 = Tooltip$1;
var Trigger = TooltipTrigger$1;
var Portal = TooltipPortal;
var Content2 = TooltipContent$1;
var Arrow2 = TooltipArrow;
function TooltipProvider({
  delayDuration = 0,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Provider,
    {
      "data-slot": "tooltip-provider",
      delayDuration,
      ...props
    }
  );
}
function Tooltip({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Root3, { "data-slot": "tooltip", ...props }) });
}
function TooltipTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Trigger, { "data-slot": "tooltip-trigger", ...props });
}
function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Content2,
    {
      "data-slot": "tooltip-content",
      sideOffset,
      className: cn(
        "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsx(Arrow2, { className: "bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" })
      ]
    }
  ) });
}
function AvatarCircle({
  name,
  avatarUrl
}) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => {
    var _a;
    return ((_a = w[0]) == null ? void 0 : _a.toUpperCase()) ?? "";
  }).join("");
  if (avatarUrl) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-16 w-16 overflow-hidden rounded-full border-2 border-[#2a3347]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: avatarUrl,
        alt: name,
        className: "h-full w-full object-cover"
      }
    ) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 font-mono text-lg font-bold tracking-wider",
      style: {
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderColor: "rgba(245, 158, 11, 0.3)",
        color: "#f59e0b"
      },
      children: initials || "?"
    }
  );
}
function PersonnelCard({
  profile,
  index,
  isS2Admin,
  onEdit
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": `personnel.card.${index}`,
      className: "group relative flex flex-col items-center gap-4 rounded border p-5 transition-all duration-200 hover:border-amber-500/50 hover:bg-amber-500/[0.02]",
      style: {
        backgroundColor: "#1a2235",
        borderColor: "#243048"
      },
      children: [
        isS2Admin && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": `personnel.edit_button.${index}`,
            onClick: () => onEdit(profile),
            className: "absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-amber-500/10",
            title: "Edit profile",
            "aria-label": "Edit personnel profile",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 text-amber-500" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarCircle, { name: profile.name, avatarUrl: profile.avatarUrl }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1.5 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-mono text-sm font-bold uppercase tracking-wider text-white", children: profile.name }),
            profile.isValidatedByCommander && /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedBadge, {})
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-[11px] uppercase tracking-wider text-slate-400", children: profile.rank || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 truncate font-mono text-[10px] text-slate-500", children: profile.orgRole || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full", children: profile.isValidatedByCommander ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3 w-3 text-amber-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] uppercase tracking-wider text-amber-500/80", children: "S2 Verified" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3 text-slate-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] uppercase tracking-wider text-slate-600", children: "Pending Verification" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClearanceBadge, { level: Number(profile.clearanceLevel) }) })
      ]
    }
  );
}
const SKELETON_IDS = ["a", "b", "c", "d", "e", "f", "g", "h"];
function PersonnelSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-ocid": "personnel.loading_state",
      className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      children: SKELETON_IDS.map((id) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex flex-col items-center gap-4 rounded border p-5",
          style: { backgroundColor: "#1a2235", borderColor: "#243048" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { width: "64px", height: "64px", className: "rounded-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "14px", className: "mx-auto w-3/4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "10px", className: "mx-auto w-1/2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "10px", className: "mx-auto w-2/3" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "22px", width: "80px", className: "rounded-full" })
          ]
        },
        id
      ))
    }
  );
}
function LockedField({
  label,
  value,
  dataOcid
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": dataOcid ?? "personnel.field_locked.tooltip",
          className: "flex items-center gap-2 rounded border px-3 py-2",
          style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3 shrink-0 text-slate-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-slate-300", children: value || "—" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TooltipContent,
        {
          side: "right",
          className: "max-w-xs font-mono text-[10px]",
          style: { backgroundColor: "#0f1626", borderColor: "#2a3347" },
          children: "Field locked after S2 verification. Submit a correction request to your S2."
        }
      )
    ] }) })
  ] });
}
function EditModal({
  profile,
  open,
  onOpenChange,
  onSuccess,
  viewerIsS2Admin,
  viewerPrincipal
}) {
  const { actor } = useExtActor();
  const queryClient = useQueryClient();
  const [lastName, setLastName] = reactExports.useState("");
  const [firstName, setFirstName] = reactExports.useState("");
  const [mi, setMi] = reactExports.useState("");
  const [rank, setRank] = reactExports.useState((profile == null ? void 0 : profile.rank) ?? "");
  const [editBranch, setEditBranch] = reactExports.useState("");
  const [editCategory, setEditCategory] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState((profile == null ? void 0 : profile.email) ?? "");
  const [orgRole, setOrgRole] = reactExports.useState((profile == null ? void 0 : profile.orgRole) ?? "");
  const [clearanceLevel, setClearanceLevel] = reactExports.useState(
    String(profile ? Number(profile.clearanceLevel) : 0)
  );
  const [makeS2Admin, setMakeS2Admin] = reactExports.useState((profile == null ? void 0 : profile.isS2Admin) ?? false);
  const [nameError, setNameError] = reactExports.useState("");
  const [showCorrectionDialog, setShowCorrectionDialog] = reactExports.useState(false);
  const prevProfileId = profile == null ? void 0 : profile.principalId.toString();
  const [lastSyncedId, setLastSyncedId] = reactExports.useState(
    prevProfileId
  );
  if (prevProfileId !== lastSyncedId && profile) {
    setLastSyncedId(prevProfileId);
    const parsed = parseDisplayName(profile.name);
    setLastName(parsed.lastName);
    setFirstName(parsed.firstName);
    setMi(parsed.mi);
    setRank(profile.rank);
    setEditBranch("");
    setEditCategory("");
    setEmail(profile.email);
    setOrgRole(profile.orgRole);
    setClearanceLevel(String(Number(profile.clearanceLevel)));
    setMakeS2Admin(profile.isS2Admin);
    setNameError("");
  }
  const isViewingOwnProfile = (profile == null ? void 0 : profile.principalId.toString()) === viewerPrincipal;
  const nameRankLocked = (profile == null ? void 0 : profile.isValidatedByCommander) === true && !viewerIsS2Admin && isViewingOwnProfile;
  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor || !profile) throw new Error("Not ready");
      const formattedName = formatDisplayName(rank, lastName, firstName, mi);
      const trimmedName = formattedName.trim();
      if (!trimmedName || !lastName.trim() || !firstName.trim()) {
        setNameError("Last name and first name are required.");
        throw new Error("Validation failed");
      }
      setNameError("");
      const updatedProfile = {
        ...profile,
        name: trimmedName,
        rank: rank.trim(),
        email: email.trim(),
        orgRole: orgRole.trim(),
        clearanceLevel: BigInt(clearanceLevel),
        isS2Admin: makeS2Admin
      };
      await actor.updateUserProfile(updatedProfile);
    },
    onSuccess: () => {
      ue.success("Profile updated");
      void queryClient.invalidateQueries({
        queryKey: [viewerPrincipal, "personnel-profiles"]
      });
      onOpenChange(false);
      onSuccess();
    },
    onError: (err) => {
      if (err.message !== "Validation failed") {
        ue.error("Failed to update profile");
      }
    }
  });
  const lockedDisplayName = profile ? formatDisplayName(rank, lastName, firstName, mi) || profile.name : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      DialogContent,
      {
        "data-ocid": "personnel.edit_modal.modal",
        className: "border sm:max-w-lg",
        style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-sm uppercase tracking-widest text-white", children: "Edit Personnel Profile" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
            nameRankLocked ? /* @__PURE__ */ jsxRuntimeExports.jsx(LockedField, { label: "Name *", value: lockedDisplayName }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "block font-mono text-[10px] uppercase tracking-widest text-slate-400", children: [
                "Name ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_1fr_56px] gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-1 block font-mono text-[9px] uppercase tracking-wider text-slate-600", children: "Last" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "personnel.edit_modal.last_name.input",
                      value: lastName,
                      onChange: (e) => {
                        setLastName(e.target.value);
                        if (e.target.value.trim()) setNameError("");
                      },
                      className: "border font-mono text-xs uppercase text-white",
                      style: {
                        backgroundColor: "#1a2235",
                        borderColor: "#2a3347"
                      },
                      placeholder: "SMITH"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-1 block font-mono text-[9px] uppercase tracking-wider text-slate-600", children: "First" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "personnel.edit_modal.first_name.input",
                      value: firstName,
                      onChange: (e) => setFirstName(e.target.value),
                      className: "border font-mono text-xs text-white",
                      style: {
                        backgroundColor: "#1a2235",
                        borderColor: "#2a3347"
                      },
                      placeholder: "John"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-1 block font-mono text-[9px] uppercase tracking-wider text-slate-600", children: "MI" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "personnel.edit_modal.mi.input",
                      value: mi,
                      onChange: (e) => setMi(e.target.value.slice(0, 1)),
                      maxLength: 1,
                      className: "border font-mono text-xs text-center uppercase text-white",
                      style: {
                        backgroundColor: "#1a2235",
                        borderColor: "#2a3347"
                      },
                      placeholder: "A"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormError, { message: nameError })
            ] }),
            nameRankLocked ? /* @__PURE__ */ jsxRuntimeExports.jsx(LockedField, { label: "Rank", value: rank }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              RankSelector,
              {
                branch: editBranch,
                category: editCategory,
                rank,
                onBranchChange: (v) => {
                  setEditBranch(v);
                  setEditCategory("");
                  setRank("");
                },
                onCategoryChange: (v) => {
                  setEditCategory(v);
                  setRank("");
                },
                onRankChange: setRank,
                variant: "modal"
              }
            ),
            nameRankLocked && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                "data-ocid": "personnel.request_correction.button",
                onClick: () => setShowCorrectionDialog(true),
                className: "font-mono text-[10px] uppercase tracking-wider text-amber-500/70 underline-offset-4 hover:text-amber-500 hover:underline",
                children: "Request Correction for Locked Fields"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400", children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "data-ocid": "personnel.edit_modal.email.input",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  className: "border font-mono text-xs text-white",
                  style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                  placeholder: "email@unit.mil",
                  type: "email"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400", children: "Org Role" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "data-ocid": "personnel.edit_modal.org_role.input",
                  value: orgRole,
                  onChange: (e) => setOrgRole(e.target.value),
                  className: "border font-mono text-xs text-white",
                  style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                  placeholder: "e.g. S2, S6, Commander"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400", children: "Clearance Level" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: clearanceLevel, onValueChange: setClearanceLevel, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  SelectTrigger,
                  {
                    "data-ocid": "personnel.edit_modal.clearance.select",
                    className: "border font-mono text-xs text-white",
                    style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select clearance level" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  SelectContent,
                  {
                    style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                    children: Object.entries(CLEARANCE_LABELS).map(([lvl, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      SelectItem,
                      {
                        value: lvl,
                        className: "font-mono text-xs text-slate-300 focus:text-white",
                        children: [
                          lvl,
                          " — ",
                          label
                        ]
                      },
                      lvl
                    ))
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center justify-between rounded border px-3 py-2.5",
                style: { borderColor: "#2a3347" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-widest text-slate-300", children: "S2 Admin" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] text-slate-600", children: "Grants full system access" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Switch,
                    {
                      "data-ocid": "personnel.edit_modal.s2_admin.switch",
                      checked: makeS2Admin,
                      onCheckedChange: setMakeS2Admin
                    }
                  )
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                "data-ocid": "personnel.edit_modal.cancel_button",
                className: "border font-mono text-xs uppercase tracking-wider text-slate-300",
                style: { borderColor: "#2a3347" },
                onClick: () => onOpenChange(false),
                disabled: mutation.isPending,
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                "data-ocid": "personnel.edit_modal.save_button",
                className: "gap-1.5 font-mono text-xs uppercase tracking-wider",
                style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                onClick: () => mutation.mutate(),
                disabled: mutation.isPending,
                children: mutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
                  "Saving…"
                ] }) : "Save Changes"
              }
            )
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AlertDialog,
      {
        open: showCorrectionDialog,
        onOpenChange: setShowCorrectionDialog,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          AlertDialogContent,
          {
            "data-ocid": "personnel.correction_info.dialog",
            style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { className: "font-mono text-sm uppercase tracking-widest text-white", children: "Locked Field Correction" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { className: "font-mono text-xs leading-relaxed text-slate-400", children: "To correct a locked field, contact your S2 or security officer directly. They will unlock and re-verify your profile. Name and rank fields are locked after S2 verification to prevent misrepresentation." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                AlertDialogAction,
                {
                  onClick: () => setShowCorrectionDialog(false),
                  className: "font-mono text-xs uppercase tracking-wider",
                  style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                  children: "Understood"
                }
              ) })
            ]
          }
        )
      }
    )
  ] });
}
function ReAuthConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  profileName
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    AlertDialogContent,
    {
      "data-ocid": "personnel.edit_verified.dialog",
      style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { className: "font-mono text-sm uppercase tracking-widest text-white", children: "Edit Verified Profile" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { className: "font-mono text-xs leading-relaxed text-slate-400", children: [
            "You are about to edit the verified profile of",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-amber-500", children: profileName }),
            ". This action is logged and requires S2 authority. Continue?"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            AlertDialogCancel,
            {
              "data-ocid": "personnel.edit_verified.cancel_button",
              className: "border font-mono text-xs uppercase tracking-wider text-slate-300",
              style: { borderColor: "#2a3347", backgroundColor: "transparent" },
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            AlertDialogAction,
            {
              "data-ocid": "personnel.edit_verified.confirm_button",
              onClick: onConfirm,
              className: "font-mono text-xs uppercase tracking-wider",
              style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
              children: "Continue"
            }
          )
        ] })
      ]
    }
  ) });
}
function OnboardingQueue({
  profiles,
  isLoading,
  principalStr,
  onVerified
}) {
  const { actor } = useExtActor();
  const queryClient = useQueryClient();
  const [confirmTarget, setConfirmTarget] = reactExports.useState(
    null
  );
  const [confirmOpen, setConfirmOpen] = reactExports.useState(false);
  const [denyTarget, setDenyTarget] = reactExports.useState(null);
  const [denyOpen, setDenyOpen] = reactExports.useState(false);
  const [denyReason, setDenyReason] = reactExports.useState("");
  const pendingProfiles = profiles.filter(
    (p) => !p.isValidatedByCommander && !p.isS2Admin
  );
  const verifyMutation = useMutation({
    mutationFn: async (profile) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.validateS2Admin(profile.principalId);
      try {
        await actor.createSystemNotification({
          id: crypto.randomUUID(),
          title: "Access Approved",
          body: "Your access request has been approved. You may now log in to Omnis.",
          userId: profile.principalId,
          notificationType: "access_request",
          createdAt: BigInt(Date.now()),
          read: false,
          metadata: void 0
        });
      } catch {
      }
    },
    onSuccess: () => {
      ue.success("User verified and activated");
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "personnel-profiles"]
      });
      setConfirmOpen(false);
      setConfirmTarget(null);
      onVerified();
    },
    onError: () => {
      ue.error("Failed to verify user");
    }
  });
  const handleVerifyClick = (profile) => {
    setConfirmTarget(profile);
    setConfirmOpen(true);
  };
  const handleDenyClick = (profile) => {
    setDenyTarget(profile);
    setDenyReason("");
    setDenyOpen(true);
  };
  const handleDenyConfirm = async () => {
    if (!denyTarget || !denyReason.trim()) return;
    localStorage.setItem(
      `omnis_denial_${denyTarget.principalId.toString()}`,
      JSON.stringify({
        reason: denyReason.trim(),
        deniedAt: (/* @__PURE__ */ new Date()).toISOString()
      })
    );
    if (actor) {
      try {
        await actor.createSystemNotification({
          id: crypto.randomUUID(),
          title: "Access Denied",
          body: `Your access request was denied. Reason: ${denyReason.trim()}. Contact your S2 or security officer.`,
          userId: denyTarget.principalId,
          notificationType: "access_request",
          createdAt: BigInt(Date.now()),
          read: false,
          metadata: void 0
        });
      } catch {
      }
    }
    void queryClient.invalidateQueries({
      queryKey: [principalStr, "personnel-profiles"]
    });
    ue.success("User denied");
    setDenyOpen(false);
    setDenyTarget(null);
    setDenyReason("");
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "personnel.queue.loading_state", className: "py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-slate-600" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-slate-600", children: "Loading queue…" })
    ] }) });
  }
  if (pendingProfiles.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "personnel.queue.empty_state",
        className: "py-12 text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "mx-auto mb-3 h-8 w-8 text-slate-700" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-wider text-slate-600", children: "No users pending verification." })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "personnel.queue.table",
        className: "overflow-hidden rounded border",
        style: { borderColor: "#1a2235" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "grid grid-cols-[1fr_auto_1fr_1fr_1fr_auto] gap-4 border-b px-4 py-2.5",
              style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
              children: ["Name", "Rank", "Email", "Org Role", "Org", "Action"].map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "font-mono text-[9px] uppercase tracking-widest text-slate-600",
                  children: col
                },
                col
              ))
            }
          ),
          pendingProfiles.map((profile, idx) => {
            let orgName = "—";
            try {
              const raw = localStorage.getItem(
                `omnis_org_request_${profile.principalId.toString()}`
              );
              if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.workspace) orgName = parsed.workspace;
              }
            } catch {
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "data-ocid": `personnel.queue.item.${idx + 1}`,
                className: "grid grid-cols-[1fr_auto_1fr_1fr_1fr_auto] items-center gap-4 border-b px-4 py-3 transition-colors last:border-0 hover:bg-white/[0.02]",
                style: { borderColor: "#1a2235" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-mono text-xs text-white", children: profile.name || "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-nowrap font-mono text-[11px] text-slate-400", children: profile.rank || "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-mono text-[11px] text-slate-500", children: profile.email || "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-mono text-[11px] text-slate-500", children: profile.orgRole || "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-mono text-[11px] text-slate-500", children: orgName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        "data-ocid": `personnel.queue.verify_button.${idx + 1}`,
                        onClick: () => handleVerifyClick(profile),
                        disabled: verifyMutation.isPending,
                        className: "shrink-0 rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-all hover:bg-amber-500/10 disabled:opacity-40",
                        style: {
                          borderColor: "rgba(245,158,11,0.4)",
                          color: "#f59e0b"
                        },
                        children: "Verify & Activate"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        "data-ocid": `personnel.queue.deny_button.${idx + 1}`,
                        onClick: () => handleDenyClick(profile),
                        disabled: verifyMutation.isPending,
                        className: "shrink-0 rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-all hover:bg-red-500/10 disabled:opacity-40",
                        style: {
                          borderColor: "rgba(239,68,68,0.3)",
                          color: "#f87171"
                        },
                        children: "Deny"
                      }
                    )
                  ] })
                ]
              },
              profile.principalId.toString()
            );
          })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: confirmOpen, onOpenChange: setConfirmOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      AlertDialogContent,
      {
        style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { className: "font-mono text-sm uppercase tracking-widest text-white", children: "Verify Personnel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { className: "font-mono text-xs leading-relaxed text-slate-400", children: [
              "Verify",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-amber-500", children: confirmTarget == null ? void 0 : confirmTarget.name }),
              " ",
              "and grant system access? This action is logged."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogCancel,
              {
                className: "border font-mono text-xs uppercase tracking-wider text-slate-300",
                style: { borderColor: "#2a3347", backgroundColor: "transparent" },
                onClick: () => {
                  setConfirmOpen(false);
                  setConfirmTarget(null);
                },
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogAction,
              {
                onClick: () => confirmTarget && verifyMutation.mutate(confirmTarget),
                disabled: verifyMutation.isPending,
                className: "font-mono text-xs uppercase tracking-wider",
                style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                children: verifyMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
                  "Verifying…"
                ] }) : "Confirm"
              }
            )
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: denyOpen, onOpenChange: setDenyOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      AlertDialogContent,
      {
        "data-ocid": "personnel.deny_dialog.dialog",
        style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { className: "font-mono text-sm uppercase tracking-widest text-white", children: "Deny Access" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { className: "font-mono text-xs leading-relaxed text-slate-400", children: [
              "Deny access for",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-red-400", children: denyTarget == null ? void 0 : denyTarget.name }),
              "? This will notify the user and record the reason."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-1 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400", children: [
              "Reason for Denial ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "personnel.deny_dialog.reason.input",
                value: denyReason,
                onChange: (e) => setDenyReason(e.target.value),
                placeholder: "Enter reason...",
                className: "border font-mono text-xs text-white placeholder:text-slate-600",
                style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogCancel,
              {
                "data-ocid": "personnel.deny_dialog.cancel_button",
                className: "border font-mono text-xs uppercase tracking-wider text-slate-300",
                style: { borderColor: "#2a3347", backgroundColor: "transparent" },
                onClick: () => {
                  setDenyOpen(false);
                  setDenyTarget(null);
                  setDenyReason("");
                },
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogAction,
              {
                "data-ocid": "personnel.deny_dialog.confirm_button",
                onClick: () => void handleDenyConfirm(),
                disabled: !denyReason.trim(),
                className: "font-mono text-xs uppercase tracking-wider disabled:opacity-40",
                style: { backgroundColor: "rgba(239,68,68,0.85)", color: "#fff" },
                children: "Confirm Deny"
              }
            )
          ] })
        ]
      }
    ) })
  ] });
}
const DEMO_PROFILE = {
  name: "1SG GRACIE, Nicholas J",
  rank: "First Sergeant (1SG)",
  orgRole: "First Sergeant, HHC 1-501ST PIR",
  clearanceLevel: 4n
};
function DemoPersonnelCard({
  isS2Admin,
  onViewProfile
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-2.5 left-3 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: "rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest",
        style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
        children: "Preview"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "personnel.demo_card",
        className: "group relative flex flex-col items-center gap-4 rounded border-2 p-5 transition-all duration-200",
        style: {
          backgroundColor: "#1a2235",
          borderColor: "#f59e0b"
        },
        children: [
          isS2Admin && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded opacity-60 hover:bg-amber-500/10 hover:opacity-100",
              title: "Demo only — edit not connected to backend",
              "aria-label": "Demo edit",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 text-amber-500/60" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "flex h-16 w-16 items-center justify-center rounded-full border-2 font-mono text-lg font-bold tracking-wider",
              style: {
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                borderColor: "rgba(245, 158, 11, 0.3)",
                color: "#f59e0b"
              },
              children: "NJG"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1.5 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-mono text-sm font-bold uppercase tracking-wider text-white", children: DEMO_PROFILE.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedBadge, {})
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-[11px] uppercase tracking-wider text-slate-400", children: DEMO_PROFILE.rank }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 truncate font-mono text-[10px] text-slate-500", children: DEMO_PROFILE.orgRole })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3 w-3 text-amber-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] uppercase tracking-wider text-amber-500/80", children: "S2 Verified" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClearanceBadge, { level: Number(DEMO_PROFILE.clearanceLevel) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              "data-ocid": "personnel.demo_view_profile.button",
              onClick: onViewProfile,
              className: "flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-amber-500/70 transition-colors hover:text-amber-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" }),
                "View Full Profile"
              ]
            }
          )
        ]
      }
    )
  ] });
}
function PersonnelPage() {
  const { actor, isFetching } = useExtActor();
  const { isS2Admin } = usePermissions();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const deferredSearchQuery = reactExports.useDeferredValue(searchQuery);
  const [clearanceFilter, setClearanceFilter] = reactExports.useState("all");
  const [editTarget, setEditTarget] = reactExports.useState(null);
  const [editOpen, setEditOpen] = reactExports.useState(false);
  const [reAuthTarget, setReAuthTarget] = reactExports.useState(
    null
  );
  const [reAuthOpen, setReAuthOpen] = reactExports.useState(false);
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: [principalStr, "personnel-profiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching
  });
  const filteredProfiles = reactExports.useMemo(() => {
    return profiles.filter((p) => {
      const matchesSearch = !deferredSearchQuery || p.name.toLowerCase().includes(deferredSearchQuery.toLowerCase());
      const matchesClearance = clearanceFilter === "all" || Number(p.clearanceLevel) === Number(clearanceFilter);
      return matchesSearch && matchesClearance;
    });
  }, [profiles, deferredSearchQuery, clearanceFilter]);
  function handleEdit(profile) {
    if (isS2Admin && profile.isValidatedByCommander) {
      setReAuthTarget(profile);
      setReAuthOpen(true);
    } else {
      setEditTarget(profile);
      setEditOpen(true);
    }
  }
  function handleReAuthConfirm() {
    setReAuthOpen(false);
    if (reAuthTarget) {
      setEditTarget(reAuthTarget);
      setEditOpen(true);
    }
    setReAuthTarget(null);
  }
  const pendingCount = profiles.filter(
    (p) => !p.isValidatedByCommander && !p.isS2Admin
  ).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "personnel.page",
      className: "flex min-h-screen flex-col",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Breadcrumb, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BreadcrumbList, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbLink, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: "Hub" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbPage, { children: "Personnel Directory" }) })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-wrap items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5 text-amber-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-white", children: "Personnel Directory" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600", children: isLoading ? "Loading..." : `${filteredProfiles.length} of ${profiles.length} personnel` })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "data-ocid": "personnel.search_input",
                  value: searchQuery,
                  onChange: (e) => setSearchQuery(e.target.value),
                  placeholder: "Search by name...",
                  className: "w-52 border font-mono text-xs text-white placeholder:text-slate-600",
                  style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: clearanceFilter,
                  onValueChange: setClearanceFilter,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      SelectTrigger,
                      {
                        "data-ocid": "personnel.clearance_filter.select",
                        className: "w-44 border font-mono text-xs text-white",
                        style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Clearances" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      SelectContent,
                      {
                        style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            SelectItem,
                            {
                              value: "all",
                              className: "font-mono text-xs text-slate-300 focus:text-white",
                              children: "All Clearances"
                            }
                          ),
                          Object.entries(CLEARANCE_LABELS).map(([lvl, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                            SelectItem,
                            {
                              value: lvl,
                              className: "font-mono text-xs text-slate-300 focus:text-white",
                              children: label
                            },
                            lvl
                          ))
                        ]
                      }
                    )
                  ]
                }
              )
            ] })
          ] }),
          isS2Admin ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "directory", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TabsList,
              {
                className: "mb-6 border",
                style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TabsTrigger,
                    {
                      value: "directory",
                      "data-ocid": "personnel.directory.tab",
                      className: "font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500",
                      children: "All Personnel"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    TabsTrigger,
                    {
                      value: "queue",
                      "data-ocid": "personnel.queue.tab",
                      className: "font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500",
                      children: [
                        "Onboarding Queue",
                        pendingCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: "ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px] font-bold",
                            style: {
                              backgroundColor: "rgba(245,158,11,0.2)",
                              color: "#f59e0b"
                            },
                            children: pendingCount
                          }
                        )
                      ]
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "directory", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(PersonnelSkeleton, {}) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                DemoPersonnelCard,
                {
                  isS2Admin,
                  onViewProfile: () => void navigate({ to: "/profile-preview" })
                }
              ),
              filteredProfiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  "data-ocid": "personnel.empty_state",
                  className: "col-span-full flex flex-col items-center py-12",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mb-3 h-8 w-8 text-slate-700" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-wider text-slate-600", children: searchQuery || clearanceFilter !== "all" ? "No personnel match your filters" : "No personnel registered" })
                  ]
                }
              ) : filteredProfiles.map((profile, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                PersonnelCard,
                {
                  profile,
                  index: idx + 1,
                  isS2Admin,
                  onEdit: handleEdit
                },
                profile.principalId.toString()
              ))
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "queue", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              OnboardingQueue,
              {
                profiles,
                isLoading,
                principalStr,
                onVerified: () => {
                }
              }
            ) })
          ] }) : (
            // Non-S2: just show the directory, no tabs
            /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(PersonnelSkeleton, {}) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                DemoPersonnelCard,
                {
                  isS2Admin,
                  onViewProfile: () => void navigate({ to: "/profile-preview" })
                }
              ),
              filteredProfiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  "data-ocid": "personnel.empty_state",
                  className: "col-span-full flex flex-col items-center py-12",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mb-3 h-8 w-8 text-slate-700" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-wider text-slate-600", children: searchQuery || clearanceFilter !== "all" ? "No personnel match your filters" : "No personnel registered" })
                  ]
                }
              ) : filteredProfiles.map((profile, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                PersonnelCard,
                {
                  profile,
                  index: idx + 1,
                  isS2Admin,
                  onEdit: handleEdit
                },
                profile.principalId.toString()
              ))
            ] }) })
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          EditModal,
          {
            profile: editTarget,
            open: editOpen,
            onOpenChange: setEditOpen,
            onSuccess: () => setEditTarget(null),
            viewerIsS2Admin: isS2Admin,
            viewerPrincipal: principalStr
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ReAuthConfirmDialog,
          {
            open: reAuthOpen,
            onOpenChange: setReAuthOpen,
            onConfirm: handleReAuthConfirm,
            profileName: (reAuthTarget == null ? void 0 : reAuthTarget.name) ?? ""
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "footer",
          {
            className: "border-t px-4 py-4 text-center",
            style: { borderColor: "#1a2235" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[10px] uppercase tracking-widest text-slate-600", children: [
              "© ",
              (/* @__PURE__ */ new Date()).getFullYear(),
              ".",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "transition-colors hover:text-slate-400",
                  children: "Built with love using caffeine.ai"
                }
              )
            ] })
          }
        )
      ]
    }
  );
}
export {
  PersonnelPage as default
};
