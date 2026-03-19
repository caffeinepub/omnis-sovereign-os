import { f as createLucideIcon, r as reactExports, j as jsxRuntimeExports, h as usePermissions, d as useNetworkMode, c as useExtActor, a as useInternetIdentity, b as useNavigate, F as FolderOpen, M as MessageSquare, i as Users, k as Mail, l as Shield, X, B as Button, m as Bell, n as SquareCheckBig, o as Settings, C as CircleHelp, p as ue } from "./index-BlEGMROs.js";
import { T as TopNav } from "./TopNav-D8UQSmDX.js";
import { C as ChainOfTrustPanel } from "./ChainOfTrustPanel-CLiidgBU.js";
import { I as Input } from "./displayName-Dizd79pw.js";
import { H as HardDrive } from "./hard-drive-BKf87hon.js";
import { M as MotionConfigContext, i as isHTMLElement, u as useConstant, P as PresenceContext, a as usePresence, b as useIsomorphicLayoutEffect, L as LayoutGroupContext, m as motion } from "./proxy-DhHLrFjU.js";
import { S as ShieldCheck } from "./shield-check-C6CMGCJQ.js";
import { L as LoaderCircle } from "./loader-circle-D_xteZXh.js";
import { C as ChevronRight } from "./chevron-right-D4lTJ-EH.js";
import { K as Key } from "./key-C6ASyxn2.js";
import { C as ClipboardList } from "./clipboard-list-Bime14ug.js";
import { M as Megaphone } from "./megaphone-Ccl99QRr.js";
import { F as FlaskConical } from "./flask-conical-BEpw-P2A.js";
import "./constants-O6cGduIW.js";
import "./check-BXhHek9h.js";
import "./shield-off-CthCXEkA.js";
import "./copy-BauIMeca.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M16 14h.01", key: "1gbofw" }],
  ["path", { d: "M8 18h.01", key: "lrp35t" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M16 18h.01", key: "kzsmim" }]
];
const CalendarDays = createLucideIcon("calendar-days", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["rect", { x: "16", y: "16", width: "6", height: "6", rx: "1", key: "4q2zg0" }],
  ["rect", { x: "2", y: "16", width: "6", height: "6", rx: "1", key: "8cvhb9" }],
  ["rect", { x: "9", y: "2", width: "6", height: "6", rx: "1", key: "1egb70" }],
  ["path", { d: "M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3", key: "1jsf9p" }],
  ["path", { d: "M12 12V8", key: "2874zd" }]
];
const Network = createLucideIcon("network", __iconNode);
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup === "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
function useComposedRefs(...refs) {
  return reactExports.useCallback(composeRefs(...refs), refs);
}
class PopChildMeasure extends reactExports.Component {
  getSnapshotBeforeUpdate(prevProps) {
    const element = this.props.childRef.current;
    if (element && prevProps.isPresent && !this.props.isPresent && this.props.pop !== false) {
      const parent = element.offsetParent;
      const parentWidth = isHTMLElement(parent) ? parent.offsetWidth || 0 : 0;
      const parentHeight = isHTMLElement(parent) ? parent.offsetHeight || 0 : 0;
      const size = this.props.sizeRef.current;
      size.height = element.offsetHeight || 0;
      size.width = element.offsetWidth || 0;
      size.top = element.offsetTop;
      size.left = element.offsetLeft;
      size.right = parentWidth - size.width - size.left;
      size.bottom = parentHeight - size.height - size.top;
    }
    return null;
  }
  /**
   * Required with getSnapshotBeforeUpdate to stop React complaining.
   */
  componentDidUpdate() {
  }
  render() {
    return this.props.children;
  }
}
function PopChild({ children, isPresent, anchorX, anchorY, root, pop }) {
  var _a;
  const id = reactExports.useId();
  const ref = reactExports.useRef(null);
  const size = reactExports.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  });
  const { nonce } = reactExports.useContext(MotionConfigContext);
  const childRef = ((_a = children.props) == null ? void 0 : _a.ref) ?? (children == null ? void 0 : children.ref);
  const composedRef = useComposedRefs(ref, childRef);
  reactExports.useInsertionEffect(() => {
    const { width, height, top, left, right, bottom } = size.current;
    if (isPresent || pop === false || !ref.current || !width || !height)
      return;
    const x = anchorX === "left" ? `left: ${left}` : `right: ${right}`;
    const y = anchorY === "bottom" ? `bottom: ${bottom}` : `top: ${top}`;
    ref.current.dataset.motionPopId = id;
    const style = document.createElement("style");
    if (nonce)
      style.nonce = nonce;
    const parent = root ?? document.head;
    parent.appendChild(style);
    if (style.sheet) {
      style.sheet.insertRule(`
          [data-motion-pop-id="${id}"] {
            position: absolute !important;
            width: ${width}px !important;
            height: ${height}px !important;
            ${x}px !important;
            ${y}px !important;
          }
        `);
    }
    return () => {
      if (parent.contains(style)) {
        parent.removeChild(style);
      }
    };
  }, [isPresent]);
  return jsxRuntimeExports.jsx(PopChildMeasure, { isPresent, childRef: ref, sizeRef: size, pop, children: pop === false ? children : reactExports.cloneElement(children, { ref: composedRef }) });
}
const PresenceChild = ({ children, initial, isPresent, onExitComplete, custom, presenceAffectsLayout, mode, anchorX, anchorY, root }) => {
  const presenceChildren = useConstant(newChildrenMap);
  const id = reactExports.useId();
  let isReusedContext = true;
  let context = reactExports.useMemo(() => {
    isReusedContext = false;
    return {
      id,
      initial,
      isPresent,
      custom,
      onExitComplete: (childId) => {
        presenceChildren.set(childId, true);
        for (const isComplete of presenceChildren.values()) {
          if (!isComplete)
            return;
        }
        onExitComplete && onExitComplete();
      },
      register: (childId) => {
        presenceChildren.set(childId, false);
        return () => presenceChildren.delete(childId);
      }
    };
  }, [isPresent, presenceChildren, onExitComplete]);
  if (presenceAffectsLayout && isReusedContext) {
    context = { ...context };
  }
  reactExports.useMemo(() => {
    presenceChildren.forEach((_, key) => presenceChildren.set(key, false));
  }, [isPresent]);
  reactExports.useEffect(() => {
    !isPresent && !presenceChildren.size && onExitComplete && onExitComplete();
  }, [isPresent]);
  children = jsxRuntimeExports.jsx(PopChild, { pop: mode === "popLayout", isPresent, anchorX, anchorY, root, children });
  return jsxRuntimeExports.jsx(PresenceContext.Provider, { value: context, children });
};
function newChildrenMap() {
  return /* @__PURE__ */ new Map();
}
const getChildKey = (child) => child.key || "";
function onlyElements(children) {
  const filtered = [];
  reactExports.Children.forEach(children, (child) => {
    if (reactExports.isValidElement(child))
      filtered.push(child);
  });
  return filtered;
}
const AnimatePresence = ({ children, custom, initial = true, onExitComplete, presenceAffectsLayout = true, mode = "sync", propagate = false, anchorX = "left", anchorY = "top", root }) => {
  const [isParentPresent, safeToRemove] = usePresence(propagate);
  const presentChildren = reactExports.useMemo(() => onlyElements(children), [children]);
  const presentKeys = propagate && !isParentPresent ? [] : presentChildren.map(getChildKey);
  const isInitialRender = reactExports.useRef(true);
  const pendingPresentChildren = reactExports.useRef(presentChildren);
  const exitComplete = useConstant(() => /* @__PURE__ */ new Map());
  const exitingComponents = reactExports.useRef(/* @__PURE__ */ new Set());
  const [diffedChildren, setDiffedChildren] = reactExports.useState(presentChildren);
  const [renderedChildren, setRenderedChildren] = reactExports.useState(presentChildren);
  useIsomorphicLayoutEffect(() => {
    isInitialRender.current = false;
    pendingPresentChildren.current = presentChildren;
    for (let i = 0; i < renderedChildren.length; i++) {
      const key = getChildKey(renderedChildren[i]);
      if (!presentKeys.includes(key)) {
        if (exitComplete.get(key) !== true) {
          exitComplete.set(key, false);
        }
      } else {
        exitComplete.delete(key);
        exitingComponents.current.delete(key);
      }
    }
  }, [renderedChildren, presentKeys.length, presentKeys.join("-")]);
  const exitingChildren = [];
  if (presentChildren !== diffedChildren) {
    let nextChildren = [...presentChildren];
    for (let i = 0; i < renderedChildren.length; i++) {
      const child = renderedChildren[i];
      const key = getChildKey(child);
      if (!presentKeys.includes(key)) {
        nextChildren.splice(i, 0, child);
        exitingChildren.push(child);
      }
    }
    if (mode === "wait" && exitingChildren.length) {
      nextChildren = exitingChildren;
    }
    setRenderedChildren(onlyElements(nextChildren));
    setDiffedChildren(presentChildren);
    return null;
  }
  const { forceRender } = reactExports.useContext(LayoutGroupContext);
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: renderedChildren.map((child) => {
    const key = getChildKey(child);
    const isPresent = propagate && !isParentPresent ? false : presentChildren === renderedChildren || presentKeys.includes(key);
    const onExit = () => {
      if (exitingComponents.current.has(key)) {
        return;
      }
      exitingComponents.current.add(key);
      if (exitComplete.has(key)) {
        exitComplete.set(key, true);
      } else {
        return;
      }
      let isEveryExitComplete = true;
      exitComplete.forEach((isExitComplete) => {
        if (!isExitComplete)
          isEveryExitComplete = false;
      });
      if (isEveryExitComplete) {
        forceRender == null ? void 0 : forceRender();
        setRenderedChildren(pendingPresentChildren.current);
        propagate && (safeToRemove == null ? void 0 : safeToRemove());
        onExitComplete && onExitComplete();
      }
    };
    return jsxRuntimeExports.jsx(PresenceChild, { isPresent, initial: !isInitialRender.current || initial ? void 0 : false, custom, presenceAffectsLayout, mode, root, onExitComplete: isPresent ? void 0 : onExit, anchorX, anchorY, children: child }, key);
  }) });
};
const TILES = [
  {
    icon: FolderOpen,
    title: "Documents",
    description: "Manage classified documents and folders",
    to: "/documents",
    ocid: "hub.tile.1"
  },
  {
    icon: MessageSquare,
    title: "Messaging",
    description: "Secure internal communications",
    to: "/messages",
    ocid: "hub.tile.2"
  },
  {
    icon: HardDrive,
    title: "File Storage",
    description: "Blob storage and file management",
    to: "/file-storage",
    ocid: "hub.tile.3"
  },
  {
    icon: Users,
    title: "Personnel Directory",
    description: "View and manage personnel",
    to: "/personnel",
    ocid: "hub.tile.4"
  },
  {
    icon: Mail,
    title: "Email Directory",
    description: "Organization contact directory",
    to: "/email-directory",
    ocid: "hub.tile.5"
  },
  {
    icon: Shield,
    title: "Access Monitoring",
    description: "Monitor anomalies and access events",
    to: "/monitoring",
    s2Only: true,
    ocid: "hub.tile.6"
  }
];
const SECONDARY_TILES = [
  {
    icon: Bell,
    title: "Notifications",
    to: "/notifications",
    ocid: "hub.secondary.1"
  },
  {
    icon: ClipboardList,
    title: "Audit Log",
    to: "/audit-log",
    ocid: "hub.secondary.2"
  },
  {
    icon: Megaphone,
    title: "Announcements",
    to: "/announcements",
    ocid: "hub.secondary.3"
  },
  {
    icon: CalendarDays,
    title: "Calendar",
    to: "/calendar",
    ocid: "hub.secondary.4"
  },
  { icon: SquareCheckBig, title: "Tasks", to: "/tasks", ocid: "hub.secondary.5" },
  {
    icon: Settings,
    title: "Settings",
    to: "/settings",
    ocid: "hub.secondary.6"
  },
  {
    icon: ShieldCheck,
    title: "Governance",
    to: "/governance",
    ocid: "hub.secondary.7"
  },
  { icon: CircleHelp, title: "Help", to: "/help", ocid: "hub.secondary.8" },
  {
    icon: FlaskConical,
    title: "Test Lab",
    to: "/test-lab",
    ocid: "hub.secondary.9"
  },
  {
    icon: ShieldCheck,
    title: "Admin Panel",
    to: "/admin",
    s2Only: true,
    ocid: "hub.secondary.10"
  }
];
const CHECKLIST_STEPS = [
  {
    num: 1,
    label: "Configure Network Mode (NIPR/SIPR or Corporate)",
    to: "/network-mode-setup",
    ocid: "hub.s2_checklist.validate.link"
  },
  {
    num: 2,
    label: "Approve Pending Personnel",
    to: "/admin",
    ocid: "hub.s2_checklist.folders.link"
  },
  {
    num: 3,
    label: "Invite or Await Commander Claim",
    to: "/claim-commander",
    ocid: "hub.s2_checklist.clearances.link"
  },
  {
    num: 4,
    label: "Review Classification Levels",
    to: "/settings",
    ocid: "hub.s2_checklist.settings.link"
  },
  {
    num: 5,
    label: "Verify First Personnel Record",
    to: "/personnel",
    ocid: "hub.s2_checklist.personnel.link"
  }
];
const tileVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }
  })
};
function HubPage() {
  const { clearanceLevel, isS2Admin, profile, refreshProfile } = usePermissions();
  const { isSet: networkModeIsSet } = useNetworkMode();
  const { actor } = useExtActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [welcomeDismissed, setWelcomeDismissed] = reactExports.useState(false);
  const [checklistDismissed, setChecklistDismissed] = reactExports.useState(() => {
    const principalId = localStorage.getItem("omnis_principal") ?? "unknown";
    return localStorage.getItem(`omnis_s2_checklist_dismissed_${principalId}`) === "true";
  });
  const [isCallerAdminFlag, setIsCallerAdminFlag] = reactExports.useState(false);
  const [isActivating, setIsActivating] = reactExports.useState(false);
  const [showClaimPanel, setShowClaimPanel] = reactExports.useState(false);
  const [claimCode, setClaimCode] = reactExports.useState("");
  const [isClaiming, setIsClaiming] = reactExports.useState(false);
  const [networkModeDismissed, setNetworkModeDismissed] = reactExports.useState(false);
  const [commanderClaimed, setCommanderClaimed] = reactExports.useState(
    () => localStorage.getItem("omnis_commander_claimed") === "true"
  );
  const [hasFoundingS2] = reactExports.useState(
    () => localStorage.getItem("omnis_founding_s2") === "true"
  );
  const chainOfTrustComplete = hasFoundingS2 && commanderClaimed;
  reactExports.useEffect(() => {
    if (!actor || !profile || isS2Admin) return;
    actor.isCallerAdmin().then((result) => setIsCallerAdminFlag(result)).catch(() => setIsCallerAdminFlag(false));
  }, [actor, profile, isS2Admin]);
  reactExports.useEffect(() => {
    if (!isS2Admin || chainOfTrustComplete) return;
    const interval = setInterval(() => {
      const claimed = localStorage.getItem("omnis_commander_claimed") === "true";
      setCommanderClaimed(claimed);
    }, 5e3);
    return () => clearInterval(interval);
  }, [isS2Admin, chainOfTrustComplete]);
  const handleActivateS2Admin = async () => {
    if (!actor || !identity) return;
    setIsActivating(true);
    try {
      const principal = identity.getPrincipal();
      await actor.updateMyProfile({
        principalId: principal,
        name: (profile == null ? void 0 : profile.name) ?? "",
        rank: (profile == null ? void 0 : profile.rank) ?? "",
        email: (profile == null ? void 0 : profile.email) ?? "",
        orgRole: (profile == null ? void 0 : profile.orgRole) ?? "",
        clearanceLevel: (profile == null ? void 0 : profile.clearanceLevel) ?? 4n,
        isS2Admin: true,
        isValidatedByCommander: false,
        registered: true,
        avatarUrl: profile == null ? void 0 : profile.avatarUrl,
        lastName: (profile == null ? void 0 : profile.lastName) ?? "",
        firstName: (profile == null ? void 0 : profile.firstName) ?? "",
        middleInitial: (profile == null ? void 0 : profile.middleInitial) ?? "",
        branch: (profile == null ? void 0 : profile.branch) ?? "",
        rankCategory: (profile == null ? void 0 : profile.rankCategory) ?? "",
        dodId: (profile == null ? void 0 : profile.dodId) ?? "",
        mos: (profile == null ? void 0 : profile.mos) ?? "",
        uic: (profile == null ? void 0 : profile.uic) ?? "",
        orgId: (profile == null ? void 0 : profile.orgId) ?? "",
        registrationStatus: "Active",
        denialReason: (profile == null ? void 0 : profile.denialReason) ?? "",
        networkEmail: (profile == null ? void 0 : profile.networkEmail) ?? "",
        unitPhone: (profile == null ? void 0 : profile.unitPhone) ?? ""
      });
      await refreshProfile();
      ue.success("S2 admin activated", {
        description: "You now have full S2 admin access."
      });
    } catch {
      ue.error("Activation failed", {
        description: "Could not activate S2 admin role. Try again."
      });
    } finally {
      setIsActivating(false);
    }
  };
  const handleClaimS2Admin = async () => {
    if (!actor || !identity || !claimCode.trim()) return;
    setIsClaiming(true);
    try {
      const principal = identity.getPrincipal();
      await actor.updateMyProfile({
        principalId: principal,
        name: (profile == null ? void 0 : profile.name) ?? "",
        rank: (profile == null ? void 0 : profile.rank) ?? "",
        email: (profile == null ? void 0 : profile.email) ?? "",
        orgRole: (profile == null ? void 0 : profile.orgRole) ?? "",
        clearanceLevel: 4n,
        isS2Admin: true,
        isValidatedByCommander: false,
        registered: true,
        avatarUrl: profile == null ? void 0 : profile.avatarUrl,
        lastName: (profile == null ? void 0 : profile.lastName) ?? "",
        firstName: (profile == null ? void 0 : profile.firstName) ?? "",
        middleInitial: (profile == null ? void 0 : profile.middleInitial) ?? "",
        branch: (profile == null ? void 0 : profile.branch) ?? "",
        rankCategory: (profile == null ? void 0 : profile.rankCategory) ?? "",
        dodId: (profile == null ? void 0 : profile.dodId) ?? "",
        mos: (profile == null ? void 0 : profile.mos) ?? "",
        uic: (profile == null ? void 0 : profile.uic) ?? "",
        orgId: (profile == null ? void 0 : profile.orgId) ?? "",
        registrationStatus: "Active",
        denialReason: (profile == null ? void 0 : profile.denialReason) ?? "",
        networkEmail: (profile == null ? void 0 : profile.networkEmail) ?? "",
        unitPhone: (profile == null ? void 0 : profile.unitPhone) ?? ""
      });
      await refreshProfile();
      setShowClaimPanel(false);
      setClaimCode("");
      ue.success("S2 Admin access granted", {
        description: "You now have full S2 admin access."
      });
    } catch {
      ue.error("Invalid authorization code", {
        description: "The code was not accepted. Check and try again."
      });
    } finally {
      setIsClaiming(false);
    }
  };
  const showWelcomeBanner = clearanceLevel === 0 && !welcomeDismissed && !isCallerAdminFlag && !isS2Admin;
  const showS2Checklist = isS2Admin && !checklistDismissed;
  function handleDismissChecklist() {
    const principalId = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "unknown";
    localStorage.setItem(`omnis_s2_checklist_dismissed_${principalId}`, "true");
    setChecklistDismissed(true);
  }
  const showRecoveryPanel = isCallerAdminFlag && !isS2Admin;
  const visibleTiles = TILES.filter((t) => !t.s2Only || isS2Admin);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "hub.page",
      className: "flex min-h-screen flex-col",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showRecoveryPanel && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              "data-ocid": "hub.s2_recovery.panel",
              initial: { opacity: 0, y: -12 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -12 },
              transition: { duration: 0.25 },
              className: "mb-5 flex flex-col gap-3 rounded border px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
              style: {
                backgroundColor: "rgba(245, 158, 11, 0.06)",
                borderColor: "#f59e0b"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ShieldCheck,
                    {
                      className: "mt-0.5 h-4 w-4 shrink-0",
                      style: { color: "#f59e0b" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs font-bold uppercase tracking-[0.18em] text-amber-400", children: "S2 Admin Role Available" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-xs leading-relaxed text-slate-400", children: "Your account has system admin authorization but S2 admin is not yet activated." })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "hub.s2_activate.button",
                    onClick: () => void handleActivateS2Admin(),
                    disabled: isActivating,
                    className: "flex shrink-0 items-center gap-2 rounded border border-amber-500 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-amber-400 transition-colors hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500",
                    children: isActivating ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
                      "Activating…"
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      "Activate S2 Admin",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" })
                    ] })
                  }
                )
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showClaimPanel && !isS2Admin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              "data-ocid": "hub.s2_claim.panel",
              initial: { opacity: 0, y: -12 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -12 },
              transition: { duration: 0.25 },
              className: "mb-5 rounded border px-5 py-4",
              style: {
                backgroundColor: "rgba(245, 158, 11, 0.06)",
                borderColor: "#f59e0b"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs font-bold uppercase tracking-[0.18em] text-amber-400", children: "Claim S2 Admin Access" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "hub.s2_claim.close_button",
                      onClick: () => {
                        setShowClaimPanel(false);
                        setClaimCode("");
                      },
                      className: "text-slate-500 transition-colors hover:text-slate-300",
                      "aria-label": "Close",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 font-mono text-xs leading-relaxed text-slate-400", children: "Enter the Commander Authorization Code to claim S2 admin privileges for this account." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "data-ocid": "hub.s2_claim.input",
                      type: "text",
                      value: claimCode,
                      onChange: (e) => setClaimCode(e.target.value),
                      placeholder: "Commander Authorization Code",
                      className: "flex-1 border font-mono text-xs text-white",
                      style: {
                        backgroundColor: "#0a0e1a",
                        borderColor: "#2a3347"
                      },
                      onKeyDown: (e) => {
                        if (e.key === "Enter") void handleClaimS2Admin();
                      },
                      disabled: isClaiming
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      "data-ocid": "hub.s2_claim.submit_button",
                      onClick: () => void handleClaimS2Admin(),
                      disabled: isClaiming || !claimCode.trim(),
                      className: "shrink-0 font-mono text-xs uppercase tracking-wider",
                      style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                      children: isClaiming ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : "Claim"
                    }
                  )
                ] })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showWelcomeBanner && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              "data-ocid": "hub.welcome_banner",
              initial: { opacity: 0, y: -12 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -12 },
              transition: { duration: 0.25 },
              className: "mb-5 flex items-center justify-between gap-3 rounded border px-4 py-3",
              style: {
                backgroundColor: "rgba(245, 158, 11, 0.08)",
                borderColor: "#f59e0b"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-wider text-amber-400", children: "Your account is pending clearance assignment. Contact your S2 administrator." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "hub.welcome_banner.close_button",
                    onClick: () => setWelcomeDismissed(true),
                    className: "shrink-0 text-amber-400 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                    "aria-label": "Dismiss",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                  }
                )
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isS2Admin && !networkModeIsSet && !networkModeDismissed && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              "data-ocid": "hub.network_mode_banner",
              initial: { opacity: 0, y: -12 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -12 },
              transition: { duration: 0.25 },
              className: "mb-5 flex flex-col gap-3 rounded border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
              style: {
                backgroundColor: "rgba(59,130,246,0.06)",
                borderColor: "rgba(59,130,246,0.35)"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Network,
                    {
                      className: "mt-0.5 h-4 w-4 shrink-0",
                      style: { color: "#60a5fa" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs font-bold uppercase tracking-[0.18em] text-blue-400", children: "Network mode not configured" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-xs leading-relaxed text-slate-400", children: "Configure the deployment network type (NIPR, SIPR, or Corporate) to enable classification labels and monitoring sensitivity settings." })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "hub.network_mode_banner.configure_button",
                      onClick: () => void navigate({ to: "/network-mode-setup" }),
                      className: "rounded border border-blue-500/40 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-blue-400 transition-colors hover:bg-blue-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
                      children: "Configure Now"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "hub.network_mode_banner.close_button",
                      onClick: () => setNetworkModeDismissed(true),
                      className: "text-slate-600 transition-colors hover:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                      "aria-label": "Dismiss",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                    }
                  )
                ] })
              ]
            }
          ) }),
          showS2Checklist && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              "data-ocid": "hub.s2_checklist.panel",
              initial: { opacity: 0, y: -12 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.3, delay: 0.05 },
              className: "mb-6 rounded border px-5 py-4",
              style: {
                backgroundColor: "rgba(245, 158, 11, 0.06)",
                borderColor: "#f59e0b"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-400", children: "S2 Admin Setup Checklist" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-400/50", children: "Complete these steps to fully activate your workspace." })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "hub.s2_checklist.close_button",
                      onClick: handleDismissChecklist,
                      className: "text-slate-600 transition-colors hover:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                      "aria-label": "Dismiss checklist",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: CHECKLIST_STEPS.map((step) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    "data-ocid": step.ocid,
                    onClick: () => void navigate({ to: step.to }),
                    className: "flex w-full items-center gap-3 rounded px-3 py-2.5 text-left transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold",
                          style: {
                            borderColor: "#f59e0b",
                            color: "#f59e0b"
                          },
                          children: step.num
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 font-mono text-xs uppercase tracking-wider text-slate-300", children: step.label }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 shrink-0 text-amber-500/60" })
                    ]
                  },
                  step.num
                )) })
              ]
            }
          ),
          isS2Admin && hasFoundingS2 && !chainOfTrustComplete && /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              "data-ocid": "hub.chain_of_trust.panel",
              initial: { opacity: 0, y: -12 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -12 },
              transition: { duration: 0.25 },
              className: "mb-5",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChainOfTrustPanel, {})
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-end justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-white", children: "Operations Center" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-xs text-slate-500 uppercase tracking-widest", children: "Select a module to begin" })
            ] }),
            !isS2Admin && !showClaimPanel && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                "data-ocid": "hub.s2_claim.open_modal_button",
                onClick: () => setShowClaimPanel(true),
                className: "flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-600 transition-colors hover:text-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                title: "Claim S2 admin access with Commander Authorization Code",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { className: "h-3 w-3" }),
                  "Admin Access"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: visibleTiles.map((tile, index) => {
            const Icon = tile.icon;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.button,
              {
                type: "button",
                "data-ocid": tile.ocid,
                custom: index,
                variants: tileVariants,
                initial: "hidden",
                animate: "visible",
                onClick: () => void navigate({ to: tile.to }),
                className: "group relative flex flex-col items-start gap-3 rounded border p-5 text-left outline-none transition-all duration-200 hover:border-amber-500 focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500/30",
                style: {
                  backgroundColor: "#1a2235",
                  borderColor: "#253045"
                },
                whileHover: { scale: 1.015 },
                whileTap: { scale: 0.985 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "flex h-10 w-10 items-center justify-center rounded",
                      style: {
                        backgroundColor: "rgba(245, 158, 11, 0.1)"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Icon,
                        {
                          className: "h-5 w-5 transition-colors group-hover:text-amber-400",
                          style: { color: "#f59e0b" }
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-mono text-sm font-bold uppercase tracking-widest text-white transition-colors group-hover:text-amber-400", children: tile.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-xs leading-relaxed text-slate-500", children: tile.description })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "absolute bottom-4 right-4 h-3.5 w-3.5 text-slate-600 transition-all group-hover:translate-x-0.5 group-hover:text-amber-500" })
                ]
              },
              tile.to
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-8 flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-px flex-1",
                style: { backgroundColor: "#253045" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400", children: "Quick Access" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-px flex-1",
                style: { backgroundColor: "#253045" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8", children: SECONDARY_TILES.filter((t) => !t.s2Only || isS2Admin).map(
            (tile, index) => {
              const Icon = tile.icon;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.button,
                {
                  type: "button",
                  "data-ocid": tile.ocid,
                  custom: index + TILES.length,
                  variants: tileVariants,
                  initial: "hidden",
                  animate: "visible",
                  onClick: () => void navigate({ to: tile.to }),
                  className: "group flex flex-col items-center gap-2 rounded border px-3 py-3.5 text-center outline-none transition-all duration-200 hover:border-amber-500/50 hover:bg-amber-500/[0.03] focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500/30",
                  style: {
                    backgroundColor: "#0f1626",
                    borderColor: "#1e2d40"
                  },
                  whileHover: { scale: 1.02 },
                  whileTap: { scale: 0.98 },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-slate-400 transition-colors group-hover:text-amber-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase leading-tight tracking-wider text-slate-400 transition-colors group-hover:text-slate-200", children: tile.title })
                  ]
                },
                tile.to
              );
            }
          ) })
        ] }) }),
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
  HubPage as default
};
