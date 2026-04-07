var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _client, _currentResult, _currentMutation, _mutateOptions, _MutationObserver_instances, updateResult_fn, notify_fn, _a;
import { ab as Subscribable, ac as shallowEqualObjects, ad as hashKey, ae as getDefaultState, af as notifyManager, a4 as useQueryClient, r as reactExports, ag as noop, ah as shouldThrowError, f as createLucideIcon, ai as shimExports, j as jsxRuntimeExports, H as createContextScope, $ as Primitive, aj as useCallbackRef, ak as useLayoutEffect2, e as cn, Z as useId, J as composeEventHandlers, G as useComposedRefs, _ as useControllableState, a0 as Presence, a1 as Portal$1, al as hideOthers, am as dispatchDiscreteCustomEvent, an as useFocusGuards, ao as ReactRemoveScroll, ap as createSlot, aq as FocusScope, a2 as DismissableLayer, ar as composeRefs, E as Root$3, I as Content$1, O as Close, X, T as Title, P as Portal$2, Q as Overlay, as as loadConfig, at as HttpAgent, au as StorageClient, h as usePermissions, d as useNetworkMode, a as useInternetIdentity, c as useExtActor, b as useNavigate, av as useRouter, a3 as useQuery, L as Link, o as Settings, M as MessageSquare, m as Bell, U as User, D as Dialog, q as DialogContent, s as DialogHeader, t as DialogTitle, v as DialogDescription, w as DialogFooter, B as Button, p as ue, k as Mail, a5 as TriangleAlert, l as Shield } from "./index-DuIlzyaK.js";
import { n as createCollection, m as useDirection, g as createPopperScope, h as Root2$1, A as Anchor, j as Content, i as Arrow, o as clamp, C as ChevronDown, e as Badge, B as Building2, L as Label$1, I as Input, p as parseDisplayName, R as RankSelector, f as formatDisplayName } from "./displayName-DxmBUfJO.js";
import { N as NETWORK_MODE_CONFIGS, B as BRANCH_RANK_CATEGORIES } from "./constants-O6cGduIW.js";
var MutationObserver = (_a = class extends Subscribable {
  constructor(client, options) {
    super();
    __privateAdd(this, _MutationObserver_instances);
    __privateAdd(this, _client);
    __privateAdd(this, _currentResult);
    __privateAdd(this, _currentMutation);
    __privateAdd(this, _mutateOptions);
    __privateSet(this, _client, client);
    this.setOptions(options);
    this.bindMethods();
    __privateMethod(this, _MutationObserver_instances, updateResult_fn).call(this);
  }
  bindMethods() {
    this.mutate = this.mutate.bind(this);
    this.reset = this.reset.bind(this);
  }
  setOptions(options) {
    var _a2;
    const prevOptions = this.options;
    this.options = __privateGet(this, _client).defaultMutationOptions(options);
    if (!shallowEqualObjects(this.options, prevOptions)) {
      __privateGet(this, _client).getMutationCache().notify({
        type: "observerOptionsUpdated",
        mutation: __privateGet(this, _currentMutation),
        observer: this
      });
    }
    if ((prevOptions == null ? void 0 : prevOptions.mutationKey) && this.options.mutationKey && hashKey(prevOptions.mutationKey) !== hashKey(this.options.mutationKey)) {
      this.reset();
    } else if (((_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.state.status) === "pending") {
      __privateGet(this, _currentMutation).setOptions(this.options);
    }
  }
  onUnsubscribe() {
    var _a2;
    if (!this.hasListeners()) {
      (_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.removeObserver(this);
    }
  }
  onMutationUpdate(action) {
    __privateMethod(this, _MutationObserver_instances, updateResult_fn).call(this);
    __privateMethod(this, _MutationObserver_instances, notify_fn).call(this, action);
  }
  getCurrentResult() {
    return __privateGet(this, _currentResult);
  }
  reset() {
    var _a2;
    (_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.removeObserver(this);
    __privateSet(this, _currentMutation, void 0);
    __privateMethod(this, _MutationObserver_instances, updateResult_fn).call(this);
    __privateMethod(this, _MutationObserver_instances, notify_fn).call(this);
  }
  mutate(variables, options) {
    var _a2;
    __privateSet(this, _mutateOptions, options);
    (_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.removeObserver(this);
    __privateSet(this, _currentMutation, __privateGet(this, _client).getMutationCache().build(__privateGet(this, _client), this.options));
    __privateGet(this, _currentMutation).addObserver(this);
    return __privateGet(this, _currentMutation).execute(variables);
  }
}, _client = new WeakMap(), _currentResult = new WeakMap(), _currentMutation = new WeakMap(), _mutateOptions = new WeakMap(), _MutationObserver_instances = new WeakSet(), updateResult_fn = function() {
  var _a2;
  const state = ((_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.state) ?? getDefaultState();
  __privateSet(this, _currentResult, {
    ...state,
    isPending: state.status === "pending",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    isIdle: state.status === "idle",
    mutate: this.mutate,
    reset: this.reset
  });
}, notify_fn = function(action) {
  notifyManager.batch(() => {
    var _a2, _b, _c, _d, _e, _f, _g, _h;
    if (__privateGet(this, _mutateOptions) && this.hasListeners()) {
      const variables = __privateGet(this, _currentResult).variables;
      const onMutateResult = __privateGet(this, _currentResult).context;
      const context = {
        client: __privateGet(this, _client),
        meta: this.options.meta,
        mutationKey: this.options.mutationKey
      };
      if ((action == null ? void 0 : action.type) === "success") {
        (_b = (_a2 = __privateGet(this, _mutateOptions)).onSuccess) == null ? void 0 : _b.call(
          _a2,
          action.data,
          variables,
          onMutateResult,
          context
        );
        (_d = (_c = __privateGet(this, _mutateOptions)).onSettled) == null ? void 0 : _d.call(
          _c,
          action.data,
          null,
          variables,
          onMutateResult,
          context
        );
      } else if ((action == null ? void 0 : action.type) === "error") {
        (_f = (_e = __privateGet(this, _mutateOptions)).onError) == null ? void 0 : _f.call(
          _e,
          action.error,
          variables,
          onMutateResult,
          context
        );
        (_h = (_g = __privateGet(this, _mutateOptions)).onSettled) == null ? void 0 : _h.call(
          _g,
          void 0,
          action.error,
          variables,
          onMutateResult,
          context
        );
      }
    }
    this.listeners.forEach((listener) => {
      listener(__privateGet(this, _currentResult));
    });
  });
}, _a);
function useMutation(options, queryClient) {
  const client = useQueryClient();
  const [observer] = reactExports.useState(
    () => new MutationObserver(
      client,
      options
    )
  );
  reactExports.useEffect(() => {
    observer.setOptions(options);
  }, [observer, options]);
  const result = reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => observer.subscribe(notifyManager.batchCalls(onStoreChange)),
      [observer]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  const mutate = reactExports.useCallback(
    (variables, mutateOptions) => {
      observer.mutate(variables, mutateOptions).catch(noop);
    },
    [observer]
  );
  if (result.error && shouldThrowError(observer.options.throwOnError, [result.error])) {
    throw result.error;
  }
  return { ...result, mutate, mutateAsync: result.mutate };
}
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode$5);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 9.9-1", key: "1mm8w8" }]
];
const LockOpen = createLucideIcon("lock-open", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
];
const Lock = createLucideIcon("lock", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
  ["path", { d: "M21 12H9", key: "dn1m92" }],
  ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }]
];
const LogOut = createLucideIcon("log-out", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", key: "1m0v6g" }],
  [
    "path",
    {
      d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
      key: "ohrbg2"
    }
  ]
];
const SquarePen = createLucideIcon("square-pen", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode);
function useIsHydrated() {
  return shimExports.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
function subscribe() {
  return () => {
  };
}
var AVATAR_NAME = "Avatar";
var [createAvatarContext] = createContextScope(AVATAR_NAME);
var [AvatarProvider, useAvatarContext] = createAvatarContext(AVATAR_NAME);
var Avatar$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, ...avatarProps } = props;
    const [imageLoadingStatus, setImageLoadingStatus] = reactExports.useState("idle");
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AvatarProvider,
      {
        scope: __scopeAvatar,
        imageLoadingStatus,
        onImageLoadingStatusChange: setImageLoadingStatus,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.span, { ...avatarProps, ref: forwardedRef })
      }
    );
  }
);
Avatar$1.displayName = AVATAR_NAME;
var IMAGE_NAME = "AvatarImage";
var AvatarImage$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, src, onLoadingStatusChange = () => {
    }, ...imageProps } = props;
    const context = useAvatarContext(IMAGE_NAME, __scopeAvatar);
    const imageLoadingStatus = useImageLoadingStatus(src, imageProps);
    const handleLoadingStatusChange = useCallbackRef((status) => {
      onLoadingStatusChange(status);
      context.onImageLoadingStatusChange(status);
    });
    useLayoutEffect2(() => {
      if (imageLoadingStatus !== "idle") {
        handleLoadingStatusChange(imageLoadingStatus);
      }
    }, [imageLoadingStatus, handleLoadingStatusChange]);
    return imageLoadingStatus === "loaded" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.img, { ...imageProps, ref: forwardedRef, src }) : null;
  }
);
AvatarImage$1.displayName = IMAGE_NAME;
var FALLBACK_NAME = "AvatarFallback";
var AvatarFallback$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, delayMs, ...fallbackProps } = props;
    const context = useAvatarContext(FALLBACK_NAME, __scopeAvatar);
    const [canRender, setCanRender] = reactExports.useState(delayMs === void 0);
    reactExports.useEffect(() => {
      if (delayMs !== void 0) {
        const timerId = window.setTimeout(() => setCanRender(true), delayMs);
        return () => window.clearTimeout(timerId);
      }
    }, [delayMs]);
    return canRender && context.imageLoadingStatus !== "loaded" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.span, { ...fallbackProps, ref: forwardedRef }) : null;
  }
);
AvatarFallback$1.displayName = FALLBACK_NAME;
function resolveLoadingStatus(image, src) {
  if (!image) {
    return "idle";
  }
  if (!src) {
    return "error";
  }
  if (image.src !== src) {
    image.src = src;
  }
  return image.complete && image.naturalWidth > 0 ? "loaded" : "loading";
}
function useImageLoadingStatus(src, { referrerPolicy, crossOrigin }) {
  const isHydrated = useIsHydrated();
  const imageRef = reactExports.useRef(null);
  const image = (() => {
    if (!isHydrated) return null;
    if (!imageRef.current) {
      imageRef.current = new window.Image();
    }
    return imageRef.current;
  })();
  const [loadingStatus, setLoadingStatus] = reactExports.useState(
    () => resolveLoadingStatus(image, src)
  );
  useLayoutEffect2(() => {
    setLoadingStatus(resolveLoadingStatus(image, src));
  }, [image, src]);
  useLayoutEffect2(() => {
    const updateStatus = (status) => () => {
      setLoadingStatus(status);
    };
    if (!image) return;
    const handleLoad = updateStatus("loaded");
    const handleError = updateStatus("error");
    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    if (referrerPolicy) {
      image.referrerPolicy = referrerPolicy;
    }
    if (typeof crossOrigin === "string") {
      image.crossOrigin = crossOrigin;
    }
    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
    };
  }, [image, crossOrigin, referrerPolicy]);
  return loadingStatus;
}
var Root$2 = Avatar$1;
var Image = AvatarImage$1;
var Fallback = AvatarFallback$1;
function Avatar({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root$2,
    {
      "data-slot": "avatar",
      className: cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      ),
      ...props
    }
  );
}
function AvatarImage({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Image,
    {
      "data-slot": "avatar-image",
      className: cn("aspect-square size-full", className),
      ...props
    }
  );
}
function AvatarFallback({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Fallback,
    {
      "data-slot": "avatar-fallback",
      className: cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      ),
      ...props
    }
  );
}
var ENTRY_FOCUS = "rovingFocusGroup.onEntryFocus";
var EVENT_OPTIONS = { bubbles: false, cancelable: true };
var GROUP_NAME$2 = "RovingFocusGroup";
var [Collection$1, useCollection$1, createCollectionScope$1] = createCollection(GROUP_NAME$2);
var [createRovingFocusGroupContext, createRovingFocusGroupScope] = createContextScope(
  GROUP_NAME$2,
  [createCollectionScope$1]
);
var [RovingFocusProvider, useRovingFocusContext] = createRovingFocusGroupContext(GROUP_NAME$2);
var RovingFocusGroup = reactExports.forwardRef(
  (props, forwardedRef) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection$1.Provider, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection$1.Slot, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RovingFocusGroupImpl, { ...props, ref: forwardedRef }) }) });
  }
);
RovingFocusGroup.displayName = GROUP_NAME$2;
var RovingFocusGroupImpl = reactExports.forwardRef((props, forwardedRef) => {
  const {
    __scopeRovingFocusGroup,
    orientation,
    loop = false,
    dir,
    currentTabStopId: currentTabStopIdProp,
    defaultCurrentTabStopId,
    onCurrentTabStopIdChange,
    onEntryFocus,
    preventScrollOnEntryFocus = false,
    ...groupProps
  } = props;
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const direction = useDirection(dir);
  const [currentTabStopId, setCurrentTabStopId] = useControllableState({
    prop: currentTabStopIdProp,
    defaultProp: defaultCurrentTabStopId ?? null,
    onChange: onCurrentTabStopIdChange,
    caller: GROUP_NAME$2
  });
  const [isTabbingBackOut, setIsTabbingBackOut] = reactExports.useState(false);
  const handleEntryFocus = useCallbackRef(onEntryFocus);
  const getItems = useCollection$1(__scopeRovingFocusGroup);
  const isClickFocusRef = reactExports.useRef(false);
  const [focusableItemsCount, setFocusableItemsCount] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener(ENTRY_FOCUS, handleEntryFocus);
      return () => node.removeEventListener(ENTRY_FOCUS, handleEntryFocus);
    }
  }, [handleEntryFocus]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    RovingFocusProvider,
    {
      scope: __scopeRovingFocusGroup,
      orientation,
      dir: direction,
      loop,
      currentTabStopId,
      onItemFocus: reactExports.useCallback(
        (tabStopId) => setCurrentTabStopId(tabStopId),
        [setCurrentTabStopId]
      ),
      onItemShiftTab: reactExports.useCallback(() => setIsTabbingBackOut(true), []),
      onFocusableItemAdd: reactExports.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount + 1),
        []
      ),
      onFocusableItemRemove: reactExports.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount - 1),
        []
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.div,
        {
          tabIndex: isTabbingBackOut || focusableItemsCount === 0 ? -1 : 0,
          "data-orientation": orientation,
          ...groupProps,
          ref: composedRefs,
          style: { outline: "none", ...props.style },
          onMouseDown: composeEventHandlers(props.onMouseDown, () => {
            isClickFocusRef.current = true;
          }),
          onFocus: composeEventHandlers(props.onFocus, (event) => {
            const isKeyboardFocus = !isClickFocusRef.current;
            if (event.target === event.currentTarget && isKeyboardFocus && !isTabbingBackOut) {
              const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);
              event.currentTarget.dispatchEvent(entryFocusEvent);
              if (!entryFocusEvent.defaultPrevented) {
                const items = getItems().filter((item) => item.focusable);
                const activeItem = items.find((item) => item.active);
                const currentItem = items.find((item) => item.id === currentTabStopId);
                const candidateItems = [activeItem, currentItem, ...items].filter(
                  Boolean
                );
                const candidateNodes = candidateItems.map((item) => item.ref.current);
                focusFirst$1(candidateNodes, preventScrollOnEntryFocus);
              }
            }
            isClickFocusRef.current = false;
          }),
          onBlur: composeEventHandlers(props.onBlur, () => setIsTabbingBackOut(false))
        }
      )
    }
  );
});
var ITEM_NAME$2 = "RovingFocusGroupItem";
var RovingFocusGroupItem = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRovingFocusGroup,
      focusable = true,
      active = false,
      tabStopId,
      children,
      ...itemProps
    } = props;
    const autoId = useId();
    const id = tabStopId || autoId;
    const context = useRovingFocusContext(ITEM_NAME$2, __scopeRovingFocusGroup);
    const isCurrentTabStop = context.currentTabStopId === id;
    const getItems = useCollection$1(__scopeRovingFocusGroup);
    const { onFocusableItemAdd, onFocusableItemRemove, currentTabStopId } = context;
    reactExports.useEffect(() => {
      if (focusable) {
        onFocusableItemAdd();
        return () => onFocusableItemRemove();
      }
    }, [focusable, onFocusableItemAdd, onFocusableItemRemove]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Collection$1.ItemSlot,
      {
        scope: __scopeRovingFocusGroup,
        id,
        focusable,
        active,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.span,
          {
            tabIndex: isCurrentTabStop ? 0 : -1,
            "data-orientation": context.orientation,
            ...itemProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!focusable) event.preventDefault();
              else context.onItemFocus(id);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => context.onItemFocus(id)),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if (event.key === "Tab" && event.shiftKey) {
                context.onItemShiftTab();
                return;
              }
              if (event.target !== event.currentTarget) return;
              const focusIntent = getFocusIntent(event, context.orientation, context.dir);
              if (focusIntent !== void 0) {
                if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
                event.preventDefault();
                const items = getItems().filter((item) => item.focusable);
                let candidateNodes = items.map((item) => item.ref.current);
                if (focusIntent === "last") candidateNodes.reverse();
                else if (focusIntent === "prev" || focusIntent === "next") {
                  if (focusIntent === "prev") candidateNodes.reverse();
                  const currentIndex = candidateNodes.indexOf(event.currentTarget);
                  candidateNodes = context.loop ? wrapArray$1(candidateNodes, currentIndex + 1) : candidateNodes.slice(currentIndex + 1);
                }
                setTimeout(() => focusFirst$1(candidateNodes));
              }
            }),
            children: typeof children === "function" ? children({ isCurrentTabStop, hasTabStop: currentTabStopId != null }) : children
          }
        )
      }
    );
  }
);
RovingFocusGroupItem.displayName = ITEM_NAME$2;
var MAP_KEY_TO_FOCUS_INTENT = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function getDirectionAwareKey(key, dir) {
  if (dir !== "rtl") return key;
  return key === "ArrowLeft" ? "ArrowRight" : key === "ArrowRight" ? "ArrowLeft" : key;
}
function getFocusIntent(event, orientation, dir) {
  const key = getDirectionAwareKey(event.key, dir);
  if (orientation === "vertical" && ["ArrowLeft", "ArrowRight"].includes(key)) return void 0;
  if (orientation === "horizontal" && ["ArrowUp", "ArrowDown"].includes(key)) return void 0;
  return MAP_KEY_TO_FOCUS_INTENT[key];
}
function focusFirst$1(candidates, preventScroll = false) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}
function wrapArray$1(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
var Root$1 = RovingFocusGroup;
var Item = RovingFocusGroupItem;
var SELECTION_KEYS = ["Enter", " "];
var FIRST_KEYS = ["ArrowDown", "PageUp", "Home"];
var LAST_KEYS = ["ArrowUp", "PageDown", "End"];
var FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
var SUB_OPEN_KEYS = {
  ltr: [...SELECTION_KEYS, "ArrowRight"],
  rtl: [...SELECTION_KEYS, "ArrowLeft"]
};
var SUB_CLOSE_KEYS = {
  ltr: ["ArrowLeft"],
  rtl: ["ArrowRight"]
};
var MENU_NAME = "Menu";
var [Collection, useCollection, createCollectionScope] = createCollection(MENU_NAME);
var [createMenuContext, createMenuScope] = createContextScope(MENU_NAME, [
  createCollectionScope,
  createPopperScope,
  createRovingFocusGroupScope
]);
var usePopperScope = createPopperScope();
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var [MenuProvider, useMenuContext] = createMenuContext(MENU_NAME);
var [MenuRootProvider, useMenuRootContext] = createMenuContext(MENU_NAME);
var Menu = (props) => {
  const { __scopeMenu, open = false, children, dir, onOpenChange, modal = true } = props;
  const popperScope = usePopperScope(__scopeMenu);
  const [content, setContent] = reactExports.useState(null);
  const isUsingKeyboardRef = reactExports.useRef(false);
  const handleOpenChange = useCallbackRef(onOpenChange);
  const direction = useDirection(dir);
  reactExports.useEffect(() => {
    const handleKeyDown = () => {
      isUsingKeyboardRef.current = true;
      document.addEventListener("pointerdown", handlePointer, { capture: true, once: true });
      document.addEventListener("pointermove", handlePointer, { capture: true, once: true });
    };
    const handlePointer = () => isUsingKeyboardRef.current = false;
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("pointerdown", handlePointer, { capture: true });
      document.removeEventListener("pointermove", handlePointer, { capture: true });
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root2$1, { ...popperScope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    MenuProvider,
    {
      scope: __scopeMenu,
      open,
      onOpenChange: handleOpenChange,
      content,
      onContentChange: setContent,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MenuRootProvider,
        {
          scope: __scopeMenu,
          onClose: reactExports.useCallback(() => handleOpenChange(false), [handleOpenChange]),
          isUsingKeyboardRef,
          dir: direction,
          modal,
          children
        }
      )
    }
  ) });
};
Menu.displayName = MENU_NAME;
var ANCHOR_NAME = "MenuAnchor";
var MenuAnchor = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...anchorProps } = props;
    const popperScope = usePopperScope(__scopeMenu);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Anchor, { ...popperScope, ...anchorProps, ref: forwardedRef });
  }
);
MenuAnchor.displayName = ANCHOR_NAME;
var PORTAL_NAME$1 = "MenuPortal";
var [PortalProvider, usePortalContext] = createMenuContext(PORTAL_NAME$1, {
  forceMount: void 0
});
var MenuPortal = (props) => {
  const { __scopeMenu, forceMount, children, container } = props;
  const context = useMenuContext(PORTAL_NAME$1, __scopeMenu);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PortalProvider, { scope: __scopeMenu, forceMount, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$1, { asChild: true, container, children }) }) });
};
MenuPortal.displayName = PORTAL_NAME$1;
var CONTENT_NAME$1 = "MenuContent";
var [MenuContentProvider, useMenuContentContext] = createMenuContext(CONTENT_NAME$1);
var MenuContent = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME$1, props.__scopeMenu);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useMenuContext(CONTENT_NAME$1, props.__scopeMenu);
    const rootContext = useMenuRootContext(CONTENT_NAME$1, props.__scopeMenu);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Provider, { scope: props.__scopeMenu, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: props.__scopeMenu, children: rootContext.modal ? /* @__PURE__ */ jsxRuntimeExports.jsx(MenuRootContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MenuRootContentNonModal, { ...contentProps, ref: forwardedRef }) }) }) });
  }
);
var MenuRootContentModal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const context = useMenuContext(CONTENT_NAME$1, props.__scopeMenu);
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    reactExports.useEffect(() => {
      const content = ref.current;
      if (content) return hideOthers(content);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuContentImpl,
      {
        ...props,
        ref: composedRefs,
        trapFocus: context.open,
        disableOutsidePointerEvents: context.open,
        disableOutsideScroll: true,
        onFocusOutside: composeEventHandlers(
          props.onFocusOutside,
          (event) => event.preventDefault(),
          { checkForDefaultPrevented: false }
        ),
        onDismiss: () => context.onOpenChange(false)
      }
    );
  }
);
var MenuRootContentNonModal = reactExports.forwardRef((props, forwardedRef) => {
  const context = useMenuContext(CONTENT_NAME$1, props.__scopeMenu);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    MenuContentImpl,
    {
      ...props,
      ref: forwardedRef,
      trapFocus: false,
      disableOutsidePointerEvents: false,
      disableOutsideScroll: false,
      onDismiss: () => context.onOpenChange(false)
    }
  );
});
var Slot = createSlot("MenuContent.ScrollLock");
var MenuContentImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeMenu,
      loop = false,
      trapFocus,
      onOpenAutoFocus,
      onCloseAutoFocus,
      disableOutsidePointerEvents,
      onEntryFocus,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onDismiss,
      disableOutsideScroll,
      ...contentProps
    } = props;
    const context = useMenuContext(CONTENT_NAME$1, __scopeMenu);
    const rootContext = useMenuRootContext(CONTENT_NAME$1, __scopeMenu);
    const popperScope = usePopperScope(__scopeMenu);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeMenu);
    const getItems = useCollection(__scopeMenu);
    const [currentItemId, setCurrentItemId] = reactExports.useState(null);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef, context.onContentChange);
    const timerRef = reactExports.useRef(0);
    const searchRef = reactExports.useRef("");
    const pointerGraceTimerRef = reactExports.useRef(0);
    const pointerGraceIntentRef = reactExports.useRef(null);
    const pointerDirRef = reactExports.useRef("right");
    const lastPointerXRef = reactExports.useRef(0);
    const ScrollLockWrapper = disableOutsideScroll ? ReactRemoveScroll : reactExports.Fragment;
    const scrollLockWrapperProps = disableOutsideScroll ? { as: Slot, allowPinchZoom: true } : void 0;
    const handleTypeaheadSearch = (key) => {
      var _a2, _b;
      const search = searchRef.current + key;
      const items = getItems().filter((item) => !item.disabled);
      const currentItem = document.activeElement;
      const currentMatch = (_a2 = items.find((item) => item.ref.current === currentItem)) == null ? void 0 : _a2.textValue;
      const values = items.map((item) => item.textValue);
      const nextMatch = getNextMatch(values, search, currentMatch);
      const newItem = (_b = items.find((item) => item.textValue === nextMatch)) == null ? void 0 : _b.ref.current;
      (function updateSearch(value) {
        searchRef.current = value;
        window.clearTimeout(timerRef.current);
        if (value !== "") timerRef.current = window.setTimeout(() => updateSearch(""), 1e3);
      })(search);
      if (newItem) {
        setTimeout(() => newItem.focus());
      }
    };
    reactExports.useEffect(() => {
      return () => window.clearTimeout(timerRef.current);
    }, []);
    useFocusGuards();
    const isPointerMovingToSubmenu = reactExports.useCallback((event) => {
      var _a2, _b;
      const isMovingTowards = pointerDirRef.current === ((_a2 = pointerGraceIntentRef.current) == null ? void 0 : _a2.side);
      return isMovingTowards && isPointerInGraceArea(event, (_b = pointerGraceIntentRef.current) == null ? void 0 : _b.area);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuContentProvider,
      {
        scope: __scopeMenu,
        searchRef,
        onItemEnter: reactExports.useCallback(
          (event) => {
            if (isPointerMovingToSubmenu(event)) event.preventDefault();
          },
          [isPointerMovingToSubmenu]
        ),
        onItemLeave: reactExports.useCallback(
          (event) => {
            var _a2;
            if (isPointerMovingToSubmenu(event)) return;
            (_a2 = contentRef.current) == null ? void 0 : _a2.focus();
            setCurrentItemId(null);
          },
          [isPointerMovingToSubmenu]
        ),
        onTriggerLeave: reactExports.useCallback(
          (event) => {
            if (isPointerMovingToSubmenu(event)) event.preventDefault();
          },
          [isPointerMovingToSubmenu]
        ),
        pointerGraceTimerRef,
        onPointerGraceIntentChange: reactExports.useCallback((intent) => {
          pointerGraceIntentRef.current = intent;
        }, []),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollLockWrapper, { ...scrollLockWrapperProps, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          FocusScope,
          {
            asChild: true,
            trapped: trapFocus,
            onMountAutoFocus: composeEventHandlers(onOpenAutoFocus, (event) => {
              var _a2;
              event.preventDefault();
              (_a2 = contentRef.current) == null ? void 0 : _a2.focus({ preventScroll: true });
            }),
            onUnmountAutoFocus: onCloseAutoFocus,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              DismissableLayer,
              {
                asChild: true,
                disableOutsidePointerEvents,
                onEscapeKeyDown,
                onPointerDownOutside,
                onFocusOutside,
                onInteractOutside,
                onDismiss,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Root$1,
                  {
                    asChild: true,
                    ...rovingFocusGroupScope,
                    dir: rootContext.dir,
                    orientation: "vertical",
                    loop,
                    currentTabStopId: currentItemId,
                    onCurrentTabStopIdChange: setCurrentItemId,
                    onEntryFocus: composeEventHandlers(onEntryFocus, (event) => {
                      if (!rootContext.isUsingKeyboardRef.current) event.preventDefault();
                    }),
                    preventScrollOnEntryFocus: true,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Content,
                      {
                        role: "menu",
                        "aria-orientation": "vertical",
                        "data-state": getOpenState(context.open),
                        "data-radix-menu-content": "",
                        dir: rootContext.dir,
                        ...popperScope,
                        ...contentProps,
                        ref: composedRefs,
                        style: { outline: "none", ...contentProps.style },
                        onKeyDown: composeEventHandlers(contentProps.onKeyDown, (event) => {
                          const target = event.target;
                          const isKeyDownInside = target.closest("[data-radix-menu-content]") === event.currentTarget;
                          const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;
                          const isCharacterKey = event.key.length === 1;
                          if (isKeyDownInside) {
                            if (event.key === "Tab") event.preventDefault();
                            if (!isModifierKey && isCharacterKey) handleTypeaheadSearch(event.key);
                          }
                          const content = contentRef.current;
                          if (event.target !== content) return;
                          if (!FIRST_LAST_KEYS.includes(event.key)) return;
                          event.preventDefault();
                          const items = getItems().filter((item) => !item.disabled);
                          const candidateNodes = items.map((item) => item.ref.current);
                          if (LAST_KEYS.includes(event.key)) candidateNodes.reverse();
                          focusFirst(candidateNodes);
                        }),
                        onBlur: composeEventHandlers(props.onBlur, (event) => {
                          if (!event.currentTarget.contains(event.target)) {
                            window.clearTimeout(timerRef.current);
                            searchRef.current = "";
                          }
                        }),
                        onPointerMove: composeEventHandlers(
                          props.onPointerMove,
                          whenMouse((event) => {
                            const target = event.target;
                            const pointerXHasChanged = lastPointerXRef.current !== event.clientX;
                            if (event.currentTarget.contains(target) && pointerXHasChanged) {
                              const newDir = event.clientX > lastPointerXRef.current ? "right" : "left";
                              pointerDirRef.current = newDir;
                              lastPointerXRef.current = event.clientX;
                            }
                          })
                        )
                      }
                    )
                  }
                )
              }
            )
          }
        ) })
      }
    );
  }
);
MenuContent.displayName = CONTENT_NAME$1;
var GROUP_NAME$1 = "MenuGroup";
var MenuGroup = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...groupProps } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.div, { role: "group", ...groupProps, ref: forwardedRef });
  }
);
MenuGroup.displayName = GROUP_NAME$1;
var LABEL_NAME$1 = "MenuLabel";
var MenuLabel = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...labelProps } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.div, { ...labelProps, ref: forwardedRef });
  }
);
MenuLabel.displayName = LABEL_NAME$1;
var ITEM_NAME$1 = "MenuItem";
var ITEM_SELECT = "menu.itemSelect";
var MenuItem = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { disabled = false, onSelect, ...itemProps } = props;
    const ref = reactExports.useRef(null);
    const rootContext = useMenuRootContext(ITEM_NAME$1, props.__scopeMenu);
    const contentContext = useMenuContentContext(ITEM_NAME$1, props.__scopeMenu);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const isPointerDownRef = reactExports.useRef(false);
    const handleSelect = () => {
      const menuItem = ref.current;
      if (!disabled && menuItem) {
        const itemSelectEvent = new CustomEvent(ITEM_SELECT, { bubbles: true, cancelable: true });
        menuItem.addEventListener(ITEM_SELECT, (event) => onSelect == null ? void 0 : onSelect(event), { once: true });
        dispatchDiscreteCustomEvent(menuItem, itemSelectEvent);
        if (itemSelectEvent.defaultPrevented) {
          isPointerDownRef.current = false;
        } else {
          rootContext.onClose();
        }
      }
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuItemImpl,
      {
        ...itemProps,
        ref: composedRefs,
        disabled,
        onClick: composeEventHandlers(props.onClick, handleSelect),
        onPointerDown: (event) => {
          var _a2;
          (_a2 = props.onPointerDown) == null ? void 0 : _a2.call(props, event);
          isPointerDownRef.current = true;
        },
        onPointerUp: composeEventHandlers(props.onPointerUp, (event) => {
          var _a2;
          if (!isPointerDownRef.current) (_a2 = event.currentTarget) == null ? void 0 : _a2.click();
        }),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          const isTypingAhead = contentContext.searchRef.current !== "";
          if (disabled || isTypingAhead && event.key === " ") return;
          if (SELECTION_KEYS.includes(event.key)) {
            event.currentTarget.click();
            event.preventDefault();
          }
        })
      }
    );
  }
);
MenuItem.displayName = ITEM_NAME$1;
var MenuItemImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, disabled = false, textValue, ...itemProps } = props;
    const contentContext = useMenuContentContext(ITEM_NAME$1, __scopeMenu);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeMenu);
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const [isFocused, setIsFocused] = reactExports.useState(false);
    const [textContent, setTextContent] = reactExports.useState("");
    reactExports.useEffect(() => {
      const menuItem = ref.current;
      if (menuItem) {
        setTextContent((menuItem.textContent ?? "").trim());
      }
    }, [itemProps.children]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Collection.ItemSlot,
      {
        scope: __scopeMenu,
        disabled,
        textValue: textValue ?? textContent,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Item, { asChild: true, ...rovingFocusGroupScope, focusable: !disabled, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            role: "menuitem",
            "data-highlighted": isFocused ? "" : void 0,
            "aria-disabled": disabled || void 0,
            "data-disabled": disabled ? "" : void 0,
            ...itemProps,
            ref: composedRefs,
            onPointerMove: composeEventHandlers(
              props.onPointerMove,
              whenMouse((event) => {
                if (disabled) {
                  contentContext.onItemLeave(event);
                } else {
                  contentContext.onItemEnter(event);
                  if (!event.defaultPrevented) {
                    const item = event.currentTarget;
                    item.focus({ preventScroll: true });
                  }
                }
              })
            ),
            onPointerLeave: composeEventHandlers(
              props.onPointerLeave,
              whenMouse((event) => contentContext.onItemLeave(event))
            ),
            onFocus: composeEventHandlers(props.onFocus, () => setIsFocused(true)),
            onBlur: composeEventHandlers(props.onBlur, () => setIsFocused(false))
          }
        ) })
      }
    );
  }
);
var CHECKBOX_ITEM_NAME$1 = "MenuCheckboxItem";
var MenuCheckboxItem = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { checked = false, onCheckedChange, ...checkboxItemProps } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicatorProvider, { scope: props.__scopeMenu, checked, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuItem,
      {
        role: "menuitemcheckbox",
        "aria-checked": isIndeterminate(checked) ? "mixed" : checked,
        ...checkboxItemProps,
        ref: forwardedRef,
        "data-state": getCheckedState(checked),
        onSelect: composeEventHandlers(
          checkboxItemProps.onSelect,
          () => onCheckedChange == null ? void 0 : onCheckedChange(isIndeterminate(checked) ? true : !checked),
          { checkForDefaultPrevented: false }
        )
      }
    ) });
  }
);
MenuCheckboxItem.displayName = CHECKBOX_ITEM_NAME$1;
var RADIO_GROUP_NAME$1 = "MenuRadioGroup";
var [RadioGroupProvider, useRadioGroupContext] = createMenuContext(
  RADIO_GROUP_NAME$1,
  { value: void 0, onValueChange: () => {
  } }
);
var MenuRadioGroup = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { value, onValueChange, ...groupProps } = props;
    const handleValueChange = useCallbackRef(onValueChange);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupProvider, { scope: props.__scopeMenu, value, onValueChange: handleValueChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuGroup, { ...groupProps, ref: forwardedRef }) });
  }
);
MenuRadioGroup.displayName = RADIO_GROUP_NAME$1;
var RADIO_ITEM_NAME$1 = "MenuRadioItem";
var MenuRadioItem = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { value, ...radioItemProps } = props;
    const context = useRadioGroupContext(RADIO_ITEM_NAME$1, props.__scopeMenu);
    const checked = value === context.value;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicatorProvider, { scope: props.__scopeMenu, checked, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuItem,
      {
        role: "menuitemradio",
        "aria-checked": checked,
        ...radioItemProps,
        ref: forwardedRef,
        "data-state": getCheckedState(checked),
        onSelect: composeEventHandlers(
          radioItemProps.onSelect,
          () => {
            var _a2;
            return (_a2 = context.onValueChange) == null ? void 0 : _a2.call(context, value);
          },
          { checkForDefaultPrevented: false }
        )
      }
    ) });
  }
);
MenuRadioItem.displayName = RADIO_ITEM_NAME$1;
var ITEM_INDICATOR_NAME = "MenuItemIndicator";
var [ItemIndicatorProvider, useItemIndicatorContext] = createMenuContext(
  ITEM_INDICATOR_NAME,
  { checked: false }
);
var MenuItemIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, forceMount, ...itemIndicatorProps } = props;
    const indicatorContext = useItemIndicatorContext(ITEM_INDICATOR_NAME, __scopeMenu);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Presence,
      {
        present: forceMount || isIndeterminate(indicatorContext.checked) || indicatorContext.checked === true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.span,
          {
            ...itemIndicatorProps,
            ref: forwardedRef,
            "data-state": getCheckedState(indicatorContext.checked)
          }
        )
      }
    );
  }
);
MenuItemIndicator.displayName = ITEM_INDICATOR_NAME;
var SEPARATOR_NAME$1 = "MenuSeparator";
var MenuSeparator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...separatorProps } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        role: "separator",
        "aria-orientation": "horizontal",
        ...separatorProps,
        ref: forwardedRef
      }
    );
  }
);
MenuSeparator.displayName = SEPARATOR_NAME$1;
var ARROW_NAME$1 = "MenuArrow";
var MenuArrow = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...arrowProps } = props;
    const popperScope = usePopperScope(__scopeMenu);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Arrow, { ...popperScope, ...arrowProps, ref: forwardedRef });
  }
);
MenuArrow.displayName = ARROW_NAME$1;
var SUB_NAME = "MenuSub";
var [MenuSubProvider, useMenuSubContext] = createMenuContext(SUB_NAME);
var SUB_TRIGGER_NAME$1 = "MenuSubTrigger";
var MenuSubTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const context = useMenuContext(SUB_TRIGGER_NAME$1, props.__scopeMenu);
    const rootContext = useMenuRootContext(SUB_TRIGGER_NAME$1, props.__scopeMenu);
    const subContext = useMenuSubContext(SUB_TRIGGER_NAME$1, props.__scopeMenu);
    const contentContext = useMenuContentContext(SUB_TRIGGER_NAME$1, props.__scopeMenu);
    const openTimerRef = reactExports.useRef(null);
    const { pointerGraceTimerRef, onPointerGraceIntentChange } = contentContext;
    const scope = { __scopeMenu: props.__scopeMenu };
    const clearOpenTimer = reactExports.useCallback(() => {
      if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }, []);
    reactExports.useEffect(() => clearOpenTimer, [clearOpenTimer]);
    reactExports.useEffect(() => {
      const pointerGraceTimer = pointerGraceTimerRef.current;
      return () => {
        window.clearTimeout(pointerGraceTimer);
        onPointerGraceIntentChange(null);
      };
    }, [pointerGraceTimerRef, onPointerGraceIntentChange]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuAnchor, { asChild: true, ...scope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuItemImpl,
      {
        id: subContext.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": context.open,
        "aria-controls": subContext.contentId,
        "data-state": getOpenState(context.open),
        ...props,
        ref: composeRefs(forwardedRef, subContext.onTriggerChange),
        onClick: (event) => {
          var _a2;
          (_a2 = props.onClick) == null ? void 0 : _a2.call(props, event);
          if (props.disabled || event.defaultPrevented) return;
          event.currentTarget.focus();
          if (!context.open) context.onOpenChange(true);
        },
        onPointerMove: composeEventHandlers(
          props.onPointerMove,
          whenMouse((event) => {
            contentContext.onItemEnter(event);
            if (event.defaultPrevented) return;
            if (!props.disabled && !context.open && !openTimerRef.current) {
              contentContext.onPointerGraceIntentChange(null);
              openTimerRef.current = window.setTimeout(() => {
                context.onOpenChange(true);
                clearOpenTimer();
              }, 100);
            }
          })
        ),
        onPointerLeave: composeEventHandlers(
          props.onPointerLeave,
          whenMouse((event) => {
            var _a2, _b;
            clearOpenTimer();
            const contentRect = (_a2 = context.content) == null ? void 0 : _a2.getBoundingClientRect();
            if (contentRect) {
              const side = (_b = context.content) == null ? void 0 : _b.dataset.side;
              const rightSide = side === "right";
              const bleed = rightSide ? -5 : 5;
              const contentNearEdge = contentRect[rightSide ? "left" : "right"];
              const contentFarEdge = contentRect[rightSide ? "right" : "left"];
              contentContext.onPointerGraceIntentChange({
                area: [
                  // Apply a bleed on clientX to ensure that our exit point is
                  // consistently within polygon bounds
                  { x: event.clientX + bleed, y: event.clientY },
                  { x: contentNearEdge, y: contentRect.top },
                  { x: contentFarEdge, y: contentRect.top },
                  { x: contentFarEdge, y: contentRect.bottom },
                  { x: contentNearEdge, y: contentRect.bottom }
                ],
                side
              });
              window.clearTimeout(pointerGraceTimerRef.current);
              pointerGraceTimerRef.current = window.setTimeout(
                () => contentContext.onPointerGraceIntentChange(null),
                300
              );
            } else {
              contentContext.onTriggerLeave(event);
              if (event.defaultPrevented) return;
              contentContext.onPointerGraceIntentChange(null);
            }
          })
        ),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          var _a2;
          const isTypingAhead = contentContext.searchRef.current !== "";
          if (props.disabled || isTypingAhead && event.key === " ") return;
          if (SUB_OPEN_KEYS[rootContext.dir].includes(event.key)) {
            context.onOpenChange(true);
            (_a2 = context.content) == null ? void 0 : _a2.focus();
            event.preventDefault();
          }
        })
      }
    ) });
  }
);
MenuSubTrigger.displayName = SUB_TRIGGER_NAME$1;
var SUB_CONTENT_NAME$1 = "MenuSubContent";
var MenuSubContent = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME$1, props.__scopeMenu);
    const { forceMount = portalContext.forceMount, ...subContentProps } = props;
    const context = useMenuContext(CONTENT_NAME$1, props.__scopeMenu);
    const rootContext = useMenuRootContext(CONTENT_NAME$1, props.__scopeMenu);
    const subContext = useMenuSubContext(SUB_CONTENT_NAME$1, props.__scopeMenu);
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Provider, { scope: props.__scopeMenu, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: props.__scopeMenu, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuContentImpl,
      {
        id: subContext.contentId,
        "aria-labelledby": subContext.triggerId,
        ...subContentProps,
        ref: composedRefs,
        align: "start",
        side: rootContext.dir === "rtl" ? "left" : "right",
        disableOutsidePointerEvents: false,
        disableOutsideScroll: false,
        trapFocus: false,
        onOpenAutoFocus: (event) => {
          var _a2;
          if (rootContext.isUsingKeyboardRef.current) (_a2 = ref.current) == null ? void 0 : _a2.focus();
          event.preventDefault();
        },
        onCloseAutoFocus: (event) => event.preventDefault(),
        onFocusOutside: composeEventHandlers(props.onFocusOutside, (event) => {
          if (event.target !== subContext.trigger) context.onOpenChange(false);
        }),
        onEscapeKeyDown: composeEventHandlers(props.onEscapeKeyDown, (event) => {
          rootContext.onClose();
          event.preventDefault();
        }),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          var _a2;
          const isKeyDownInside = event.currentTarget.contains(event.target);
          const isCloseKey = SUB_CLOSE_KEYS[rootContext.dir].includes(event.key);
          if (isKeyDownInside && isCloseKey) {
            context.onOpenChange(false);
            (_a2 = subContext.trigger) == null ? void 0 : _a2.focus();
            event.preventDefault();
          }
        })
      }
    ) }) }) });
  }
);
MenuSubContent.displayName = SUB_CONTENT_NAME$1;
function getOpenState(open) {
  return open ? "open" : "closed";
}
function isIndeterminate(checked) {
  return checked === "indeterminate";
}
function getCheckedState(checked) {
  return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}
function focusFirst(candidates) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus();
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}
function wrapArray(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
function getNextMatch(values, search, currentMatch) {
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0]);
  const normalizedSearch = isRepeated ? search[0] : search;
  const currentMatchIndex = currentMatch ? values.indexOf(currentMatch) : -1;
  let wrappedValues = wrapArray(values, Math.max(currentMatchIndex, 0));
  const excludeCurrentMatch = normalizedSearch.length === 1;
  if (excludeCurrentMatch) wrappedValues = wrappedValues.filter((v) => v !== currentMatch);
  const nextMatch = wrappedValues.find(
    (value) => value.toLowerCase().startsWith(normalizedSearch.toLowerCase())
  );
  return nextMatch !== currentMatch ? nextMatch : void 0;
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
function isPointerInGraceArea(event, area) {
  if (!area) return false;
  const cursorPos = { x: event.clientX, y: event.clientY };
  return isPointInPolygon(cursorPos, area);
}
function whenMouse(handler) {
  return (event) => event.pointerType === "mouse" ? handler(event) : void 0;
}
var Root3 = Menu;
var Anchor2 = MenuAnchor;
var Portal = MenuPortal;
var Content2$1 = MenuContent;
var Group = MenuGroup;
var Label = MenuLabel;
var Item2$1 = MenuItem;
var CheckboxItem = MenuCheckboxItem;
var RadioGroup = MenuRadioGroup;
var RadioItem = MenuRadioItem;
var ItemIndicator = MenuItemIndicator;
var Separator = MenuSeparator;
var Arrow2 = MenuArrow;
var SubTrigger = MenuSubTrigger;
var SubContent = MenuSubContent;
var DROPDOWN_MENU_NAME = "DropdownMenu";
var [createDropdownMenuContext] = createContextScope(
  DROPDOWN_MENU_NAME,
  [createMenuScope]
);
var useMenuScope = createMenuScope();
var [DropdownMenuProvider, useDropdownMenuContext] = createDropdownMenuContext(DROPDOWN_MENU_NAME);
var DropdownMenu$1 = (props) => {
  const {
    __scopeDropdownMenu,
    children,
    dir,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = true
  } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  const triggerRef = reactExports.useRef(null);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: DROPDOWN_MENU_NAME
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DropdownMenuProvider,
    {
      scope: __scopeDropdownMenu,
      triggerId: useId(),
      triggerRef,
      contentId: useId(),
      open,
      onOpenChange: setOpen,
      onOpenToggle: reactExports.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
      modal,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Root3, { ...menuScope, open, onOpenChange: setOpen, dir, modal, children })
    }
  );
};
DropdownMenu$1.displayName = DROPDOWN_MENU_NAME;
var TRIGGER_NAME = "DropdownMenuTrigger";
var DropdownMenuTrigger$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, disabled = false, ...triggerProps } = props;
    const context = useDropdownMenuContext(TRIGGER_NAME, __scopeDropdownMenu);
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Anchor2, { asChild: true, ...menuScope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        id: context.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": context.open,
        "aria-controls": context.open ? context.contentId : void 0,
        "data-state": context.open ? "open" : "closed",
        "data-disabled": disabled ? "" : void 0,
        disabled,
        ...triggerProps,
        ref: composeRefs(forwardedRef, context.triggerRef),
        onPointerDown: composeEventHandlers(props.onPointerDown, (event) => {
          if (!disabled && event.button === 0 && event.ctrlKey === false) {
            context.onOpenToggle();
            if (!context.open) event.preventDefault();
          }
        }),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          if (disabled) return;
          if (["Enter", " "].includes(event.key)) context.onOpenToggle();
          if (event.key === "ArrowDown") context.onOpenChange(true);
          if (["Enter", " ", "ArrowDown"].includes(event.key)) event.preventDefault();
        })
      }
    ) });
  }
);
DropdownMenuTrigger$1.displayName = TRIGGER_NAME;
var PORTAL_NAME = "DropdownMenuPortal";
var DropdownMenuPortal = (props) => {
  const { __scopeDropdownMenu, ...portalProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { ...menuScope, ...portalProps });
};
DropdownMenuPortal.displayName = PORTAL_NAME;
var CONTENT_NAME = "DropdownMenuContent";
var DropdownMenuContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...contentProps } = props;
    const context = useDropdownMenuContext(CONTENT_NAME, __scopeDropdownMenu);
    const menuScope = useMenuScope(__scopeDropdownMenu);
    const hasInteractedOutsideRef = reactExports.useRef(false);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Content2$1,
      {
        id: context.contentId,
        "aria-labelledby": context.triggerId,
        ...menuScope,
        ...contentProps,
        ref: forwardedRef,
        onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
          var _a2;
          if (!hasInteractedOutsideRef.current) (_a2 = context.triggerRef.current) == null ? void 0 : _a2.focus();
          hasInteractedOutsideRef.current = false;
          event.preventDefault();
        }),
        onInteractOutside: composeEventHandlers(props.onInteractOutside, (event) => {
          const originalEvent = event.detail.originalEvent;
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          if (!context.modal || isRightClick) hasInteractedOutsideRef.current = true;
        }),
        style: {
          ...props.style,
          // re-namespace exposed content custom properties
          ...{
            "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
            "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
            "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
            "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
            "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
          }
        }
      }
    );
  }
);
DropdownMenuContent$1.displayName = CONTENT_NAME;
var GROUP_NAME = "DropdownMenuGroup";
var DropdownMenuGroup = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...groupProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Group, { ...menuScope, ...groupProps, ref: forwardedRef });
  }
);
DropdownMenuGroup.displayName = GROUP_NAME;
var LABEL_NAME = "DropdownMenuLabel";
var DropdownMenuLabel = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...labelProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { ...menuScope, ...labelProps, ref: forwardedRef });
  }
);
DropdownMenuLabel.displayName = LABEL_NAME;
var ITEM_NAME = "DropdownMenuItem";
var DropdownMenuItem$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...itemProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Item2$1, { ...menuScope, ...itemProps, ref: forwardedRef });
  }
);
DropdownMenuItem$1.displayName = ITEM_NAME;
var CHECKBOX_ITEM_NAME = "DropdownMenuCheckboxItem";
var DropdownMenuCheckboxItem = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...checkboxItemProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckboxItem, { ...menuScope, ...checkboxItemProps, ref: forwardedRef });
});
DropdownMenuCheckboxItem.displayName = CHECKBOX_ITEM_NAME;
var RADIO_GROUP_NAME = "DropdownMenuRadioGroup";
var DropdownMenuRadioGroup = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...radioGroupProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroup, { ...menuScope, ...radioGroupProps, ref: forwardedRef });
});
DropdownMenuRadioGroup.displayName = RADIO_GROUP_NAME;
var RADIO_ITEM_NAME = "DropdownMenuRadioItem";
var DropdownMenuRadioItem = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...radioItemProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RadioItem, { ...menuScope, ...radioItemProps, ref: forwardedRef });
});
DropdownMenuRadioItem.displayName = RADIO_ITEM_NAME;
var INDICATOR_NAME = "DropdownMenuItemIndicator";
var DropdownMenuItemIndicator = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...itemIndicatorProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator, { ...menuScope, ...itemIndicatorProps, ref: forwardedRef });
});
DropdownMenuItemIndicator.displayName = INDICATOR_NAME;
var SEPARATOR_NAME = "DropdownMenuSeparator";
var DropdownMenuSeparator$1 = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...separatorProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { ...menuScope, ...separatorProps, ref: forwardedRef });
});
DropdownMenuSeparator$1.displayName = SEPARATOR_NAME;
var ARROW_NAME = "DropdownMenuArrow";
var DropdownMenuArrow = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...arrowProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Arrow2, { ...menuScope, ...arrowProps, ref: forwardedRef });
  }
);
DropdownMenuArrow.displayName = ARROW_NAME;
var SUB_TRIGGER_NAME = "DropdownMenuSubTrigger";
var DropdownMenuSubTrigger = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...subTriggerProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SubTrigger, { ...menuScope, ...subTriggerProps, ref: forwardedRef });
});
DropdownMenuSubTrigger.displayName = SUB_TRIGGER_NAME;
var SUB_CONTENT_NAME = "DropdownMenuSubContent";
var DropdownMenuSubContent = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...subContentProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    SubContent,
    {
      ...menuScope,
      ...subContentProps,
      ref: forwardedRef,
      style: {
        ...props.style,
        // re-namespace exposed content custom properties
        ...{
          "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
          "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
          "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
          "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
          "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
        }
      }
    }
  );
});
DropdownMenuSubContent.displayName = SUB_CONTENT_NAME;
var Root2 = DropdownMenu$1;
var Trigger = DropdownMenuTrigger$1;
var Portal2 = DropdownMenuPortal;
var Content2 = DropdownMenuContent$1;
var Item2 = DropdownMenuItem$1;
var Separator2 = DropdownMenuSeparator$1;
function DropdownMenu({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root2, { "data-slot": "dropdown-menu", ...props });
}
function DropdownMenuTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Trigger,
    {
      "data-slot": "dropdown-menu-trigger",
      ...props
    }
  );
}
function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Portal2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Content2,
    {
      "data-slot": "dropdown-menu-content",
      sideOffset,
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
        className
      ),
      ...props
    }
  ) });
}
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Item2,
    {
      "data-slot": "dropdown-menu-item",
      "data-inset": inset,
      "data-variant": variant,
      className: cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
function DropdownMenuSeparator({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Separator2,
    {
      "data-slot": "dropdown-menu-separator",
      className: cn("bg-border -mx-1 my-1 h-px", className),
      ...props
    }
  );
}
function useStateMachine(initialState, machine) {
  return reactExports.useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState ?? state;
  }, initialState);
}
var SCROLL_AREA_NAME = "ScrollArea";
var [createScrollAreaContext] = createContextScope(SCROLL_AREA_NAME);
var [ScrollAreaProvider, useScrollAreaContext] = createScrollAreaContext(SCROLL_AREA_NAME);
var ScrollArea$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeScrollArea,
      type = "hover",
      dir,
      scrollHideDelay = 600,
      ...scrollAreaProps
    } = props;
    const [scrollArea, setScrollArea] = reactExports.useState(null);
    const [viewport, setViewport] = reactExports.useState(null);
    const [content, setContent] = reactExports.useState(null);
    const [scrollbarX, setScrollbarX] = reactExports.useState(null);
    const [scrollbarY, setScrollbarY] = reactExports.useState(null);
    const [cornerWidth, setCornerWidth] = reactExports.useState(0);
    const [cornerHeight, setCornerHeight] = reactExports.useState(0);
    const [scrollbarXEnabled, setScrollbarXEnabled] = reactExports.useState(false);
    const [scrollbarYEnabled, setScrollbarYEnabled] = reactExports.useState(false);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setScrollArea(node));
    const direction = useDirection(dir);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScrollAreaProvider,
      {
        scope: __scopeScrollArea,
        type,
        dir: direction,
        scrollHideDelay,
        scrollArea,
        viewport,
        onViewportChange: setViewport,
        content,
        onContentChange: setContent,
        scrollbarX,
        onScrollbarXChange: setScrollbarX,
        scrollbarXEnabled,
        onScrollbarXEnabledChange: setScrollbarXEnabled,
        scrollbarY,
        onScrollbarYChange: setScrollbarY,
        scrollbarYEnabled,
        onScrollbarYEnabledChange: setScrollbarYEnabled,
        onCornerWidthChange: setCornerWidth,
        onCornerHeightChange: setCornerHeight,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            dir: direction,
            ...scrollAreaProps,
            ref: composedRefs,
            style: {
              position: "relative",
              // Pass corner sizes as CSS vars to reduce re-renders of context consumers
              ["--radix-scroll-area-corner-width"]: cornerWidth + "px",
              ["--radix-scroll-area-corner-height"]: cornerHeight + "px",
              ...props.style
            }
          }
        )
      }
    );
  }
);
ScrollArea$1.displayName = SCROLL_AREA_NAME;
var VIEWPORT_NAME = "ScrollAreaViewport";
var ScrollAreaViewport = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeScrollArea, children, nonce, ...viewportProps } = props;
    const context = useScrollAreaContext(VIEWPORT_NAME, __scopeScrollArea);
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref, context.onViewportChange);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "style",
        {
          dangerouslySetInnerHTML: {
            __html: `[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}`
          },
          nonce
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.div,
        {
          "data-radix-scroll-area-viewport": "",
          ...viewportProps,
          ref: composedRefs,
          style: {
            /**
             * We don't support `visible` because the intention is to have at least one scrollbar
             * if this component is used and `visible` will behave like `auto` in that case
             * https://developer.mozilla.org/en-US/docs/Web/CSS/overflow#description
             *
             * We don't handle `auto` because the intention is for the native implementation
             * to be hidden if using this component. We just want to ensure the node is scrollable
             * so could have used either `scroll` or `auto` here. We picked `scroll` to prevent
             * the browser from having to work out whether to render native scrollbars or not,
             * we tell it to with the intention of hiding them in CSS.
             */
            overflowX: context.scrollbarXEnabled ? "scroll" : "hidden",
            overflowY: context.scrollbarYEnabled ? "scroll" : "hidden",
            ...props.style
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: context.onContentChange, style: { minWidth: "100%", display: "table" }, children })
        }
      )
    ] });
  }
);
ScrollAreaViewport.displayName = VIEWPORT_NAME;
var SCROLLBAR_NAME = "ScrollAreaScrollbar";
var ScrollAreaScrollbar = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...scrollbarProps } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
    const { onScrollbarXEnabledChange, onScrollbarYEnabledChange } = context;
    const isHorizontal = props.orientation === "horizontal";
    reactExports.useEffect(() => {
      isHorizontal ? onScrollbarXEnabledChange(true) : onScrollbarYEnabledChange(true);
      return () => {
        isHorizontal ? onScrollbarXEnabledChange(false) : onScrollbarYEnabledChange(false);
      };
    }, [isHorizontal, onScrollbarXEnabledChange, onScrollbarYEnabledChange]);
    return context.type === "hover" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaScrollbarHover, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "scroll" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaScrollbarScroll, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "auto" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaScrollbarAuto, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "always" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaScrollbarVisible, { ...scrollbarProps, ref: forwardedRef }) : null;
  }
);
ScrollAreaScrollbar.displayName = SCROLLBAR_NAME;
var ScrollAreaScrollbarHover = reactExports.forwardRef((props, forwardedRef) => {
  const { forceMount, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [visible, setVisible] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const scrollArea = context.scrollArea;
    let hideTimer = 0;
    if (scrollArea) {
      const handlePointerEnter = () => {
        window.clearTimeout(hideTimer);
        setVisible(true);
      };
      const handlePointerLeave = () => {
        hideTimer = window.setTimeout(() => setVisible(false), context.scrollHideDelay);
      };
      scrollArea.addEventListener("pointerenter", handlePointerEnter);
      scrollArea.addEventListener("pointerleave", handlePointerLeave);
      return () => {
        window.clearTimeout(hideTimer);
        scrollArea.removeEventListener("pointerenter", handlePointerEnter);
        scrollArea.removeEventListener("pointerleave", handlePointerLeave);
      };
    }
  }, [context.scrollArea, context.scrollHideDelay]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || visible, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    ScrollAreaScrollbarAuto,
    {
      "data-state": visible ? "visible" : "hidden",
      ...scrollbarProps,
      ref: forwardedRef
    }
  ) });
});
var ScrollAreaScrollbarScroll = reactExports.forwardRef((props, forwardedRef) => {
  const { forceMount, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const isHorizontal = props.orientation === "horizontal";
  const debounceScrollEnd = useDebounceCallback(() => send("SCROLL_END"), 100);
  const [state, send] = useStateMachine("hidden", {
    hidden: {
      SCROLL: "scrolling"
    },
    scrolling: {
      SCROLL_END: "idle",
      POINTER_ENTER: "interacting"
    },
    interacting: {
      SCROLL: "interacting",
      POINTER_LEAVE: "idle"
    },
    idle: {
      HIDE: "hidden",
      SCROLL: "scrolling",
      POINTER_ENTER: "interacting"
    }
  });
  reactExports.useEffect(() => {
    if (state === "idle") {
      const hideTimer = window.setTimeout(() => send("HIDE"), context.scrollHideDelay);
      return () => window.clearTimeout(hideTimer);
    }
  }, [state, context.scrollHideDelay, send]);
  reactExports.useEffect(() => {
    const viewport = context.viewport;
    const scrollDirection = isHorizontal ? "scrollLeft" : "scrollTop";
    if (viewport) {
      let prevScrollPos = viewport[scrollDirection];
      const handleScroll = () => {
        const scrollPos = viewport[scrollDirection];
        const hasScrollInDirectionChanged = prevScrollPos !== scrollPos;
        if (hasScrollInDirectionChanged) {
          send("SCROLL");
          debounceScrollEnd();
        }
        prevScrollPos = scrollPos;
      };
      viewport.addEventListener("scroll", handleScroll);
      return () => viewport.removeEventListener("scroll", handleScroll);
    }
  }, [context.viewport, isHorizontal, send, debounceScrollEnd]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || state !== "hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    ScrollAreaScrollbarVisible,
    {
      "data-state": state === "hidden" ? "hidden" : "visible",
      ...scrollbarProps,
      ref: forwardedRef,
      onPointerEnter: composeEventHandlers(props.onPointerEnter, () => send("POINTER_ENTER")),
      onPointerLeave: composeEventHandlers(props.onPointerLeave, () => send("POINTER_LEAVE"))
    }
  ) });
});
var ScrollAreaScrollbarAuto = reactExports.forwardRef((props, forwardedRef) => {
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const { forceMount, ...scrollbarProps } = props;
  const [visible, setVisible] = reactExports.useState(false);
  const isHorizontal = props.orientation === "horizontal";
  const handleResize = useDebounceCallback(() => {
    if (context.viewport) {
      const isOverflowX = context.viewport.offsetWidth < context.viewport.scrollWidth;
      const isOverflowY = context.viewport.offsetHeight < context.viewport.scrollHeight;
      setVisible(isHorizontal ? isOverflowX : isOverflowY);
    }
  }, 10);
  useResizeObserver(context.viewport, handleResize);
  useResizeObserver(context.content, handleResize);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || visible, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    ScrollAreaScrollbarVisible,
    {
      "data-state": visible ? "visible" : "hidden",
      ...scrollbarProps,
      ref: forwardedRef
    }
  ) });
});
var ScrollAreaScrollbarVisible = reactExports.forwardRef((props, forwardedRef) => {
  const { orientation = "vertical", ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const thumbRef = reactExports.useRef(null);
  const pointerOffsetRef = reactExports.useRef(0);
  const [sizes, setSizes] = reactExports.useState({
    content: 0,
    viewport: 0,
    scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 }
  });
  const thumbRatio = getThumbRatio(sizes.viewport, sizes.content);
  const commonProps = {
    ...scrollbarProps,
    sizes,
    onSizesChange: setSizes,
    hasThumb: Boolean(thumbRatio > 0 && thumbRatio < 1),
    onThumbChange: (thumb) => thumbRef.current = thumb,
    onThumbPointerUp: () => pointerOffsetRef.current = 0,
    onThumbPointerDown: (pointerPos) => pointerOffsetRef.current = pointerPos
  };
  function getScrollPosition(pointerPos, dir) {
    return getScrollPositionFromPointer(pointerPos, pointerOffsetRef.current, sizes, dir);
  }
  if (orientation === "horizontal") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScrollAreaScrollbarX,
      {
        ...commonProps,
        ref: forwardedRef,
        onThumbPositionChange: () => {
          if (context.viewport && thumbRef.current) {
            const scrollPos = context.viewport.scrollLeft;
            const offset = getThumbOffsetFromScroll(scrollPos, sizes, context.dir);
            thumbRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
          }
        },
        onWheelScroll: (scrollPos) => {
          if (context.viewport) context.viewport.scrollLeft = scrollPos;
        },
        onDragScroll: (pointerPos) => {
          if (context.viewport) {
            context.viewport.scrollLeft = getScrollPosition(pointerPos, context.dir);
          }
        }
      }
    );
  }
  if (orientation === "vertical") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScrollAreaScrollbarY,
      {
        ...commonProps,
        ref: forwardedRef,
        onThumbPositionChange: () => {
          if (context.viewport && thumbRef.current) {
            const scrollPos = context.viewport.scrollTop;
            const offset = getThumbOffsetFromScroll(scrollPos, sizes);
            thumbRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
          }
        },
        onWheelScroll: (scrollPos) => {
          if (context.viewport) context.viewport.scrollTop = scrollPos;
        },
        onDragScroll: (pointerPos) => {
          if (context.viewport) context.viewport.scrollTop = getScrollPosition(pointerPos);
        }
      }
    );
  }
  return null;
});
var ScrollAreaScrollbarX = reactExports.forwardRef((props, forwardedRef) => {
  const { sizes, onSizesChange, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [computedStyle, setComputedStyle] = reactExports.useState();
  const ref = reactExports.useRef(null);
  const composeRefs2 = useComposedRefs(forwardedRef, ref, context.onScrollbarXChange);
  reactExports.useEffect(() => {
    if (ref.current) setComputedStyle(getComputedStyle(ref.current));
  }, [ref]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ScrollAreaScrollbarImpl,
    {
      "data-orientation": "horizontal",
      ...scrollbarProps,
      ref: composeRefs2,
      sizes,
      style: {
        bottom: 0,
        left: context.dir === "rtl" ? "var(--radix-scroll-area-corner-width)" : 0,
        right: context.dir === "ltr" ? "var(--radix-scroll-area-corner-width)" : 0,
        ["--radix-scroll-area-thumb-width"]: getThumbSize(sizes) + "px",
        ...props.style
      },
      onThumbPointerDown: (pointerPos) => props.onThumbPointerDown(pointerPos.x),
      onDragScroll: (pointerPos) => props.onDragScroll(pointerPos.x),
      onWheelScroll: (event, maxScrollPos) => {
        if (context.viewport) {
          const scrollPos = context.viewport.scrollLeft + event.deltaX;
          props.onWheelScroll(scrollPos);
          if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
            event.preventDefault();
          }
        }
      },
      onResize: () => {
        if (ref.current && context.viewport && computedStyle) {
          onSizesChange({
            content: context.viewport.scrollWidth,
            viewport: context.viewport.offsetWidth,
            scrollbar: {
              size: ref.current.clientWidth,
              paddingStart: toInt(computedStyle.paddingLeft),
              paddingEnd: toInt(computedStyle.paddingRight)
            }
          });
        }
      }
    }
  );
});
var ScrollAreaScrollbarY = reactExports.forwardRef((props, forwardedRef) => {
  const { sizes, onSizesChange, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [computedStyle, setComputedStyle] = reactExports.useState();
  const ref = reactExports.useRef(null);
  const composeRefs2 = useComposedRefs(forwardedRef, ref, context.onScrollbarYChange);
  reactExports.useEffect(() => {
    if (ref.current) setComputedStyle(getComputedStyle(ref.current));
  }, [ref]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ScrollAreaScrollbarImpl,
    {
      "data-orientation": "vertical",
      ...scrollbarProps,
      ref: composeRefs2,
      sizes,
      style: {
        top: 0,
        right: context.dir === "ltr" ? 0 : void 0,
        left: context.dir === "rtl" ? 0 : void 0,
        bottom: "var(--radix-scroll-area-corner-height)",
        ["--radix-scroll-area-thumb-height"]: getThumbSize(sizes) + "px",
        ...props.style
      },
      onThumbPointerDown: (pointerPos) => props.onThumbPointerDown(pointerPos.y),
      onDragScroll: (pointerPos) => props.onDragScroll(pointerPos.y),
      onWheelScroll: (event, maxScrollPos) => {
        if (context.viewport) {
          const scrollPos = context.viewport.scrollTop + event.deltaY;
          props.onWheelScroll(scrollPos);
          if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
            event.preventDefault();
          }
        }
      },
      onResize: () => {
        if (ref.current && context.viewport && computedStyle) {
          onSizesChange({
            content: context.viewport.scrollHeight,
            viewport: context.viewport.offsetHeight,
            scrollbar: {
              size: ref.current.clientHeight,
              paddingStart: toInt(computedStyle.paddingTop),
              paddingEnd: toInt(computedStyle.paddingBottom)
            }
          });
        }
      }
    }
  );
});
var [ScrollbarProvider, useScrollbarContext] = createScrollAreaContext(SCROLLBAR_NAME);
var ScrollAreaScrollbarImpl = reactExports.forwardRef((props, forwardedRef) => {
  const {
    __scopeScrollArea,
    sizes,
    hasThumb,
    onThumbChange,
    onThumbPointerUp,
    onThumbPointerDown,
    onThumbPositionChange,
    onDragScroll,
    onWheelScroll,
    onResize,
    ...scrollbarProps
  } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, __scopeScrollArea);
  const [scrollbar, setScrollbar] = reactExports.useState(null);
  const composeRefs2 = useComposedRefs(forwardedRef, (node) => setScrollbar(node));
  const rectRef = reactExports.useRef(null);
  const prevWebkitUserSelectRef = reactExports.useRef("");
  const viewport = context.viewport;
  const maxScrollPos = sizes.content - sizes.viewport;
  const handleWheelScroll = useCallbackRef(onWheelScroll);
  const handleThumbPositionChange = useCallbackRef(onThumbPositionChange);
  const handleResize = useDebounceCallback(onResize, 10);
  function handleDragScroll(event) {
    if (rectRef.current) {
      const x = event.clientX - rectRef.current.left;
      const y = event.clientY - rectRef.current.top;
      onDragScroll({ x, y });
    }
  }
  reactExports.useEffect(() => {
    const handleWheel = (event) => {
      const element = event.target;
      const isScrollbarWheel = scrollbar == null ? void 0 : scrollbar.contains(element);
      if (isScrollbarWheel) handleWheelScroll(event, maxScrollPos);
    };
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleWheel, { passive: false });
  }, [viewport, scrollbar, maxScrollPos, handleWheelScroll]);
  reactExports.useEffect(handleThumbPositionChange, [sizes, handleThumbPositionChange]);
  useResizeObserver(scrollbar, handleResize);
  useResizeObserver(context.content, handleResize);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ScrollbarProvider,
    {
      scope: __scopeScrollArea,
      scrollbar,
      hasThumb,
      onThumbChange: useCallbackRef(onThumbChange),
      onThumbPointerUp: useCallbackRef(onThumbPointerUp),
      onThumbPositionChange: handleThumbPositionChange,
      onThumbPointerDown: useCallbackRef(onThumbPointerDown),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.div,
        {
          ...scrollbarProps,
          ref: composeRefs2,
          style: { position: "absolute", ...scrollbarProps.style },
          onPointerDown: composeEventHandlers(props.onPointerDown, (event) => {
            const mainPointer = 0;
            if (event.button === mainPointer) {
              const element = event.target;
              element.setPointerCapture(event.pointerId);
              rectRef.current = scrollbar.getBoundingClientRect();
              prevWebkitUserSelectRef.current = document.body.style.webkitUserSelect;
              document.body.style.webkitUserSelect = "none";
              if (context.viewport) context.viewport.style.scrollBehavior = "auto";
              handleDragScroll(event);
            }
          }),
          onPointerMove: composeEventHandlers(props.onPointerMove, handleDragScroll),
          onPointerUp: composeEventHandlers(props.onPointerUp, (event) => {
            const element = event.target;
            if (element.hasPointerCapture(event.pointerId)) {
              element.releasePointerCapture(event.pointerId);
            }
            document.body.style.webkitUserSelect = prevWebkitUserSelectRef.current;
            if (context.viewport) context.viewport.style.scrollBehavior = "";
            rectRef.current = null;
          })
        }
      )
    }
  );
});
var THUMB_NAME = "ScrollAreaThumb";
var ScrollAreaThumb = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...thumbProps } = props;
    const scrollbarContext = useScrollbarContext(THUMB_NAME, props.__scopeScrollArea);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || scrollbarContext.hasThumb, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaThumbImpl, { ref: forwardedRef, ...thumbProps }) });
  }
);
var ScrollAreaThumbImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeScrollArea, style, ...thumbProps } = props;
    const scrollAreaContext = useScrollAreaContext(THUMB_NAME, __scopeScrollArea);
    const scrollbarContext = useScrollbarContext(THUMB_NAME, __scopeScrollArea);
    const { onThumbPositionChange } = scrollbarContext;
    const composedRef = useComposedRefs(
      forwardedRef,
      (node) => scrollbarContext.onThumbChange(node)
    );
    const removeUnlinkedScrollListenerRef = reactExports.useRef(void 0);
    const debounceScrollEnd = useDebounceCallback(() => {
      if (removeUnlinkedScrollListenerRef.current) {
        removeUnlinkedScrollListenerRef.current();
        removeUnlinkedScrollListenerRef.current = void 0;
      }
    }, 100);
    reactExports.useEffect(() => {
      const viewport = scrollAreaContext.viewport;
      if (viewport) {
        const handleScroll = () => {
          debounceScrollEnd();
          if (!removeUnlinkedScrollListenerRef.current) {
            const listener = addUnlinkedScrollListener(viewport, onThumbPositionChange);
            removeUnlinkedScrollListenerRef.current = listener;
            onThumbPositionChange();
          }
        };
        onThumbPositionChange();
        viewport.addEventListener("scroll", handleScroll);
        return () => viewport.removeEventListener("scroll", handleScroll);
      }
    }, [scrollAreaContext.viewport, debounceScrollEnd, onThumbPositionChange]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        "data-state": scrollbarContext.hasThumb ? "visible" : "hidden",
        ...thumbProps,
        ref: composedRef,
        style: {
          width: "var(--radix-scroll-area-thumb-width)",
          height: "var(--radix-scroll-area-thumb-height)",
          ...style
        },
        onPointerDownCapture: composeEventHandlers(props.onPointerDownCapture, (event) => {
          const thumb = event.target;
          const thumbRect = thumb.getBoundingClientRect();
          const x = event.clientX - thumbRect.left;
          const y = event.clientY - thumbRect.top;
          scrollbarContext.onThumbPointerDown({ x, y });
        }),
        onPointerUp: composeEventHandlers(props.onPointerUp, scrollbarContext.onThumbPointerUp)
      }
    );
  }
);
ScrollAreaThumb.displayName = THUMB_NAME;
var CORNER_NAME = "ScrollAreaCorner";
var ScrollAreaCorner = reactExports.forwardRef(
  (props, forwardedRef) => {
    const context = useScrollAreaContext(CORNER_NAME, props.__scopeScrollArea);
    const hasBothScrollbarsVisible = Boolean(context.scrollbarX && context.scrollbarY);
    const hasCorner = context.type !== "scroll" && hasBothScrollbarsVisible;
    return hasCorner ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaCornerImpl, { ...props, ref: forwardedRef }) : null;
  }
);
ScrollAreaCorner.displayName = CORNER_NAME;
var ScrollAreaCornerImpl = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeScrollArea, ...cornerProps } = props;
  const context = useScrollAreaContext(CORNER_NAME, __scopeScrollArea);
  const [width, setWidth] = reactExports.useState(0);
  const [height, setHeight] = reactExports.useState(0);
  const hasSize = Boolean(width && height);
  useResizeObserver(context.scrollbarX, () => {
    var _a2;
    const height2 = ((_a2 = context.scrollbarX) == null ? void 0 : _a2.offsetHeight) || 0;
    context.onCornerHeightChange(height2);
    setHeight(height2);
  });
  useResizeObserver(context.scrollbarY, () => {
    var _a2;
    const width2 = ((_a2 = context.scrollbarY) == null ? void 0 : _a2.offsetWidth) || 0;
    context.onCornerWidthChange(width2);
    setWidth(width2);
  });
  return hasSize ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.div,
    {
      ...cornerProps,
      ref: forwardedRef,
      style: {
        width,
        height,
        position: "absolute",
        right: context.dir === "ltr" ? 0 : void 0,
        left: context.dir === "rtl" ? 0 : void 0,
        bottom: 0,
        ...props.style
      }
    }
  ) : null;
});
function toInt(value) {
  return value ? parseInt(value, 10) : 0;
}
function getThumbRatio(viewportSize, contentSize) {
  const ratio = viewportSize / contentSize;
  return isNaN(ratio) ? 0 : ratio;
}
function getThumbSize(sizes) {
  const ratio = getThumbRatio(sizes.viewport, sizes.content);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const thumbSize = (sizes.scrollbar.size - scrollbarPadding) * ratio;
  return Math.max(thumbSize, 18);
}
function getScrollPositionFromPointer(pointerPos, pointerOffset, sizes, dir = "ltr") {
  const thumbSizePx = getThumbSize(sizes);
  const thumbCenter = thumbSizePx / 2;
  const offset = pointerOffset || thumbCenter;
  const thumbOffsetFromEnd = thumbSizePx - offset;
  const minPointerPos = sizes.scrollbar.paddingStart + offset;
  const maxPointerPos = sizes.scrollbar.size - sizes.scrollbar.paddingEnd - thumbOffsetFromEnd;
  const maxScrollPos = sizes.content - sizes.viewport;
  const scrollRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const interpolate = linearScale([minPointerPos, maxPointerPos], scrollRange);
  return interpolate(pointerPos);
}
function getThumbOffsetFromScroll(scrollPos, sizes, dir = "ltr") {
  const thumbSizePx = getThumbSize(sizes);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const scrollbar = sizes.scrollbar.size - scrollbarPadding;
  const maxScrollPos = sizes.content - sizes.viewport;
  const maxThumbPos = scrollbar - thumbSizePx;
  const scrollClampRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const scrollWithoutMomentum = clamp(scrollPos, scrollClampRange);
  const interpolate = linearScale([0, maxScrollPos], [0, maxThumbPos]);
  return interpolate(scrollWithoutMomentum);
}
function linearScale(input, output) {
  return (value) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}
function isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos) {
  return scrollPos > 0 && scrollPos < maxScrollPos;
}
var addUnlinkedScrollListener = (node, handler = () => {
}) => {
  let prevPosition = { left: node.scrollLeft, top: node.scrollTop };
  let rAF = 0;
  (function loop() {
    const position = { left: node.scrollLeft, top: node.scrollTop };
    const isHorizontalScroll = prevPosition.left !== position.left;
    const isVerticalScroll = prevPosition.top !== position.top;
    if (isHorizontalScroll || isVerticalScroll) handler();
    prevPosition = position;
    rAF = window.requestAnimationFrame(loop);
  })();
  return () => window.cancelAnimationFrame(rAF);
};
function useDebounceCallback(callback, delay) {
  const handleCallback = useCallbackRef(callback);
  const debounceTimerRef = reactExports.useRef(0);
  reactExports.useEffect(() => () => window.clearTimeout(debounceTimerRef.current), []);
  return reactExports.useCallback(() => {
    window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(handleCallback, delay);
  }, [handleCallback, delay]);
}
function useResizeObserver(element, onResize) {
  const handleResize = useCallbackRef(onResize);
  useLayoutEffect2(() => {
    let rAF = 0;
    if (element) {
      const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(rAF);
        rAF = window.requestAnimationFrame(handleResize);
      });
      resizeObserver.observe(element);
      return () => {
        window.cancelAnimationFrame(rAF);
        resizeObserver.unobserve(element);
      };
    }
  }, [element, handleResize]);
}
var Root = ScrollArea$1;
var Viewport = ScrollAreaViewport;
var Corner = ScrollAreaCorner;
function ScrollArea({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Root,
    {
      "data-slot": "scroll-area",
      className: cn("relative", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Viewport,
          {
            "data-slot": "scroll-area-viewport",
            className: "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
            children
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollBar, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Corner, {})
      ]
    }
  );
}
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ScrollAreaScrollbar,
    {
      "data-slot": "scroll-area-scrollbar",
      orientation,
      className: cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        ScrollAreaThumb,
        {
          "data-slot": "scroll-area-thumb",
          className: "bg-border relative flex-1 rounded-full"
        }
      )
    }
  );
}
function Sheet({ ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root$3, { "data-slot": "sheet", ...props });
}
function SheetPortal({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$2, { "data-slot": "sheet-portal", ...props });
}
function SheetOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Overlay,
    {
      "data-slot": "sheet-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function SheetContent({
  className,
  children,
  side = "right",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetPortal, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SheetOverlay, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Content$1,
      {
        "data-slot": "sheet-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        ),
        ...props,
        children: [
          children,
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
}
function SheetHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "sheet-header",
      className: cn("flex flex-col gap-1.5 p-4", className),
      ...props
    }
  );
}
function SheetFooter({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "sheet-footer",
      className: cn("mt-auto flex flex-col gap-2 p-4", className),
      ...props
    }
  );
}
function SheetTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Title,
    {
      "data-slot": "sheet-title",
      className: cn("text-foreground font-semibold", className),
      ...props
    }
  );
}
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "skeleton",
      className: cn("bg-accent animate-pulse rounded-md", className),
      ...props
    }
  );
}
function Textarea({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "textarea",
    {
      "data-slot": "textarea",
      className: cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ...props
    }
  );
}
function useStorageClient(identity) {
  const [state, setState] = reactExports.useState({
    client: null,
    isReady: false
  });
  reactExports.useEffect(() => {
    let cancelled = false;
    async function init() {
      var _a2;
      try {
        const config = await loadConfig();
        const agentOptions = identity ? { identity } : {};
        const agent = new HttpAgent({
          ...agentOptions,
          host: config.backend_host
        });
        if ((_a2 = config.backend_host) == null ? void 0 : _a2.includes("localhost")) {
          await agent.fetchRootKey().catch(() => {
          });
        }
        const client = new StorageClient(
          config.bucket_name,
          config.storage_gateway_url,
          config.backend_canister_id,
          config.project_id,
          agent
        );
        if (!cancelled) {
          setState({ client, isReady: true });
        }
      } catch (err) {
        console.error("Failed to initialize storage client:", err);
        if (!cancelled) {
          setState({ client: null, isReady: true });
        }
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [identity]);
  return state;
}
function formatRelativeTime(nanoTimestamp) {
  const ms = Number(nanoTimestamp / 1000000n);
  const now = Date.now();
  const diffMs = now - ms;
  if (diffMs < 0) return "just now";
  const seconds = Math.floor(diffMs / 1e3);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}
function formatDate(nanoTimestamp) {
  const ms = Number(nanoTimestamp / 1000000n);
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function formatDateTime(nanoTimestamp) {
  const ms = Number(nanoTimestamp / 1000000n);
  return new Date(ms).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function getInitials$1(name) {
  if (!name.trim()) return "??";
  return name.split(/[\s,]+/).filter(Boolean).slice(0, 2).map((w) => {
    var _a2;
    return ((_a2 = w[0]) == null ? void 0 : _a2.toUpperCase()) ?? "";
  }).join("");
}
function getInitials(name) {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => {
    var _a2;
    return ((_a2 = w[0]) == null ? void 0 : _a2.toUpperCase()) ?? "";
  }).join("");
}
function inferBranchCategory(rank) {
  if (!rank) return { branch: "", category: "" };
  for (const [branch, categories] of Object.entries(BRANCH_RANK_CATEGORIES)) {
    for (const [category, ranks] of Object.entries(categories)) {
      if (ranks.includes(rank)) {
        return { branch, category };
      }
    }
  }
  return { branch: "", category: "" };
}
function getNotificationIcon(type) {
  switch (type) {
    case "clearance_changed":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 shrink-0 text-slate-400" });
    case "access_granted":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(LockOpen, { className: "h-4 w-4 shrink-0 text-green-400" });
    case "access_revoked":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4 shrink-0 text-red-400" });
    case "anomaly_detected":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 shrink-0 text-amber-400" });
    case "message_received":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4 shrink-0 text-blue-400" });
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 shrink-0 text-slate-400" });
  }
}
function ProfileSheet({ open, onOpenChange }) {
  const { profile, refreshProfile } = usePermissions();
  const { actor } = useExtActor();
  const { identity } = useInternetIdentity();
  const { client: storageClient, isReady: storageReady } = useStorageClient(
    identity ?? null
  );
  const fileInputRef = reactExports.useRef(null);
  const navigate = useNavigate();
  const [lastName, setLastName] = reactExports.useState("");
  const [firstName, setFirstName] = reactExports.useState("");
  const [mi, setMi] = reactExports.useState("");
  const [branch, setBranch] = reactExports.useState("");
  const [category, setCategory] = reactExports.useState("");
  const [rankVal, setRankVal] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState((profile == null ? void 0 : profile.email) ?? "");
  const [orgRole, setOrgRole] = reactExports.useState((profile == null ? void 0 : profile.orgRole) ?? "");
  const [avatarUrl, setAvatarUrl] = reactExports.useState((profile == null ? void 0 : profile.avatarUrl) ?? "");
  const [isUploadingAvatar, setIsUploadingAvatar] = reactExports.useState(false);
  const [isSaving, setIsSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (open && profile) {
      const parsed = parseDisplayName(profile.name ?? "");
      setLastName(parsed.lastName);
      setFirstName(parsed.firstName);
      setMi(parsed.mi);
      const rankStr = profile.rank ?? "";
      setRankVal(rankStr);
      const inferred = inferBranchCategory(rankStr);
      setBranch(inferred.branch);
      setCategory(inferred.category);
      setEmail(profile.email);
      setOrgRole(profile.orgRole);
      setAvatarUrl(profile.avatarUrl ?? "");
    }
  }, [open, profile]);
  async function handleAvatarUpload(e) {
    var _a2;
    const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
    if (!file || !storageClient || !storageReady) {
      ue.error("Storage not ready. Please try again.");
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      const url = await storageClient.getDirectURL(hash);
      setAvatarUrl(url);
      ue.success("Avatar uploaded");
    } catch {
      ue.error("Avatar upload failed");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }
  async function handleSave() {
    if (!actor || !profile) return;
    setIsSaving(true);
    try {
      const effectiveRank = rankVal.trim() || profile.rank;
      const formattedName = formatDisplayName(
        effectiveRank,
        lastName,
        firstName,
        mi
      );
      await actor.updateMyProfile({
        ...profile,
        name: formattedName,
        rank: effectiveRank,
        email: email.trim(),
        orgRole: orgRole.trim(),
        avatarUrl: avatarUrl || void 0
      });
      await refreshProfile();
      ue.success("Profile updated");
      onOpenChange(false);
    } catch {
      ue.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }
  const initials = (profile == null ? void 0 : profile.name) ? getInitials(profile.name) : "??";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SheetContent,
    {
      "data-ocid": "topnav.profile.modal",
      className: "flex w-[380px] flex-col border-l p-0 sm:max-w-[380px]",
      style: { backgroundColor: "#0a0e1a", borderColor: "#1a2235" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          SheetHeader,
          {
            className: "border-b px-6 py-4",
            style: { borderColor: "#1a2235" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { className: "font-mono text-sm uppercase tracking-[0.2em] text-white", children: "Profile" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-widest text-slate-600", children: "Non-sensitive fields only" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 px-6 py-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Avatar,
              {
                className: "h-16 w-16 border-2",
                style: { borderColor: "rgba(245,158,11,0.3)" },
                children: [
                  avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: avatarUrl, alt: (profile == null ? void 0 : profile.name) ?? "" }) : null,
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AvatarFallback,
                    {
                      className: "font-mono text-lg font-bold",
                      style: {
                        backgroundColor: "rgba(245,158,11,0.1)",
                        color: "#f59e0b"
                      },
                      children: initials
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: fileInputRef,
                type: "file",
                accept: "image/*",
                className: "hidden",
                onChange: (e) => void handleAvatarUpload(e)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "sm",
                "data-ocid": "topnav.profile.avatar.upload_button",
                className: "h-7 gap-1.5 border font-mono text-[10px] uppercase tracking-wider text-slate-400",
                style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                onClick: () => {
                  var _a2;
                  return (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
                },
                disabled: isUploadingAvatar || !storageReady,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3 w-3" }),
                  isUploadingAvatar ? "Uploading…" : "Upload Photo"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                "data-ocid": "topnav.profile.view_full.link",
                className: "flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-amber-400 transition-colors hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                onClick: () => {
                  onOpenChange(false);
                  void navigate({ to: "/my-profile" });
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" }),
                  "View Full Profile"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "rounded border px-3 py-2",
              style: { borderColor: "#1a2235", backgroundColor: "#0d1525" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] uppercase tracking-widest text-slate-600", children: "Clearance Level" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 font-mono text-xs text-amber-500", children: [
                  (profile == null ? void 0 : profile.clearanceLevel) !== void 0 ? `Level ${Number(profile.clearanceLevel)}` : "—",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: "(managed by S2 admin)" })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_1fr_52px] gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label$1, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Last Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "topnav.profile.name.last.input",
                    value: lastName,
                    onChange: (e) => setLastName(e.target.value),
                    className: "border font-mono text-xs text-white",
                    style: {
                      backgroundColor: "#1a2235",
                      borderColor: "#2a3347"
                    },
                    placeholder: "SMITH"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label$1, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "First Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "topnav.profile.name.first.input",
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
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label$1, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "MI" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "topnav.profile.name.mi.input",
                    value: mi,
                    onChange: (e) => setMi(e.target.value.slice(0, 1)),
                    className: "border font-mono text-xs text-white",
                    style: {
                      backgroundColor: "#1a2235",
                      borderColor: "#2a3347"
                    },
                    placeholder: "A",
                    maxLength: 1
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            RankSelector,
            {
              branch,
              category,
              rank: rankVal,
              onBranchChange: setBranch,
              onCategoryChange: setCategory,
              onRankChange: setRankVal,
              variant: "modal"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label$1, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "border font-mono text-xs text-white",
                style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label$1, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-500", children: "Organizational Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: orgRole,
                onChange: (e) => setOrgRole(e.target.value),
                className: "border font-mono text-xs text-white",
                style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          SheetFooter,
          {
            className: "flex gap-2 border-t px-6 py-4",
            style: { borderColor: "#1a2235" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  "data-ocid": "topnav.profile.cancel_button",
                  className: "flex-1 border font-mono text-xs uppercase tracking-wider text-slate-400",
                  style: { backgroundColor: "#1a2235", borderColor: "#2a3347" },
                  onClick: () => onOpenChange(false),
                  disabled: isSaving,
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  "data-ocid": "topnav.profile.save_button",
                  className: "flex-1 font-mono text-xs uppercase tracking-wider",
                  style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                  onClick: () => void handleSave(),
                  disabled: isSaving,
                  children: isSaving ? "Saving…" : "Save"
                }
              )
            ]
          }
        )
      ]
    }
  ) });
}
function TopNav() {
  var _a2, _b;
  const { profile, isS2Admin } = usePermissions();
  const [requestUnitOpen, setRequestUnitOpen] = reactExports.useState(false);
  const [requestUnitId, setRequestUnitId] = reactExports.useState("");
  const [requestUnitReason, setRequestUnitReason] = reactExports.useState("");
  const { mode: networkMode } = useNetworkMode();
  const { clear, identity } = useInternetIdentity();
  const { actor, isFetching } = useExtActor();
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [profileSheetOpen, setProfileSheetOpen] = reactExports.useState(false);
  const currentPath = router.state.location.pathname;
  function isActivePath(to) {
    if (to === "/") return currentPath === "/";
    return currentPath === to || currentPath.startsWith(`${to}/`);
  }
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  const handleSignOut = () => {
    queryClient.clear();
    clear();
    window.location.href = "/login";
  };
  const { data: unreadCount = 0 } = useQuery({
    queryKey: [principalStr, "unreadNotificationCount"],
    queryFn: async () => {
      if (!actor) return 0;
      try {
        const count = await actor.getUnreadNotificationCount();
        return Number(count);
      } catch {
        return 0;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchInterval: 3e4
  });
  const {
    data: notifications = [],
    isFetching: notifsFetching,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: [principalStr, "topnav-notifications-preview"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const items = await actor.getMyNotifications();
        return items.sort((a, b) => a.createdAt > b.createdAt ? -1 : 1);
      } catch {
        return [];
      }
    },
    enabled: false,
    // only fetch on dropdown open
    staleTime: 0
  });
  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) return;
      await actor.markNotificationRead(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "unreadNotificationCount"]
      });
      void refetchNotifications();
    }
  });
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.markAllNotificationsRead();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "unreadNotificationCount"]
      });
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "topnav-notifications-preview"]
      });
      void refetchNotifications();
    }
  });
  const { data: recentInboxMessages = [], refetch: refetchInbox } = useQuery({
    queryKey: [principalStr, "topnav-inbox-preview"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const msgs = await actor.getInboxMessages();
        return msgs.filter((m) => !m.deleted).sort((a, b) => a.sentAt > b.sentAt ? -1 : 1).slice(0, 5);
      } catch {
        return [];
      }
    },
    enabled: false,
    // only fetch on dropdown open
    staleTime: 0
  });
  const unreadMsgCount = recentInboxMessages.filter((m) => !m.read).length;
  const initials = (profile == null ? void 0 : profile.name) ? getInitials(profile.name) : "OP";
  const displayName = ((_a2 = profile == null ? void 0 : profile.name) == null ? void 0 : _a2.trim()) || "OPERATOR";
  const navLinks = [
    { label: "Documents", to: "/documents", ocid: "topnav.documents.link" },
    { label: "Messaging", to: "/messages", ocid: "topnav.messages.link" },
    {
      label: "File Storage",
      to: "/file-storage",
      ocid: "topnav.file_storage.link"
    },
    {
      label: "Personnel Directory",
      to: "/personnel",
      ocid: "topnav.personnel.link"
    },
    {
      label: "Email Directory",
      to: "/email-directory",
      ocid: "topnav.email_directory.link"
    },
    ...isS2Admin ? [
      {
        label: "Access Monitoring",
        to: "/monitoring",
        ocid: "topnav.monitoring.link"
      }
    ] : []
  ];
  const secondaryNavLinks = [
    {
      label: "Notifications",
      to: "/notifications",
      ocid: "topnav.notifications.link"
    },
    { label: "Audit Log", to: "/audit-log", ocid: "topnav.audit_log.link" },
    {
      label: "Announcements",
      to: "/announcements",
      ocid: "topnav.announcements.link"
    },
    { label: "Calendar", to: "/calendar", ocid: "topnav.calendar.link" },
    { label: "Tasks", to: "/tasks", ocid: "topnav.tasks.link" },
    { label: "Settings", to: "/settings", ocid: "topnav.settings.link" },
    { label: "Governance", to: "/governance", ocid: "topnav.governance.link" },
    { label: "Help", to: "/help", ocid: "topnav.help.link" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProfileSheet,
      {
        open: profileSheetOpen,
        onOpenChange: setProfileSheetOpen
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "header",
      {
        className: "sticky top-0 z-50 flex h-14 w-full items-center justify-between px-4",
        style: {
          backgroundColor: "#0a0e1a",
          borderBottom: "1px solid #1a2235"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/",
                "data-ocid": "topnav.link",
                className: "flex flex-col shrink-0 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "font-mono text-lg font-bold uppercase tracking-[0.25em] leading-none",
                      style: { color: "#f59e0b" },
                      children: "OMNIS"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden font-mono text-[9px] uppercase tracking-widest text-slate-500 leading-none mt-0.5 sm:block", children: "Sovereign OS" })
                ]
              }
            ),
            networkMode && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest",
                style: {
                  borderColor: networkMode.startsWith("military") ? "rgba(59,130,246,0.4)" : "rgba(139,92,246,0.4)",
                  color: networkMode.startsWith("military") ? "#60a5fa" : "#a78bfa",
                  backgroundColor: networkMode.startsWith("military") ? "rgba(59,130,246,0.08)" : "rgba(139,92,246,0.08)"
                },
                children: ((_b = NETWORK_MODE_CONFIGS[networkMode]) == null ? void 0 : _b.shortCode) ?? ""
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                DropdownMenuTrigger,
                {
                  "data-ocid": "topnav.hub_dropdown.toggle",
                  className: "flex items-center gap-1 rounded px-3 py-1.5 font-mono text-sm font-semibold uppercase tracking-widest text-slate-300 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                  children: [
                    "Hub",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 opacity-60" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                DropdownMenuContent,
                {
                  align: "start",
                  className: "min-w-[200px] border font-mono",
                  style: {
                    backgroundColor: "#0f1626",
                    borderColor: "#1a2235"
                  },
                  children: [
                    navLinks.map((link) => {
                      const active = isActivePath(link.to);
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        DropdownMenuItem,
                        {
                          "data-ocid": link.ocid,
                          className: "cursor-pointer font-mono text-xs uppercase tracking-widest hover:text-white focus:text-white",
                          style: { color: active ? "#f59e0b" : "#cbd5e1" },
                          onClick: () => void navigate({ to: link.to }),
                          children: [
                            active && /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "span",
                              {
                                className: "mr-2 inline-block h-1.5 w-1.5 rounded-full",
                                style: { backgroundColor: "#f59e0b" },
                                "aria-hidden": "true"
                              }
                            ),
                            link.label
                          ]
                        },
                        link.to
                      );
                    }),
                    isS2Admin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      DropdownMenuItem,
                      {
                        "data-ocid": "topnav.hub_dropdown.admin_panel.link",
                        className: "cursor-pointer font-mono text-xs uppercase tracking-widest text-amber-400 hover:text-amber-300 focus:text-amber-300",
                        onClick: () => void navigate({ to: "/admin" }),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "mr-2 h-3 w-3" }),
                          "Admin Panel"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, { style: { backgroundColor: "#1a2235" } }),
                    secondaryNavLinks.map((link) => {
                      const active = isActivePath(link.to);
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        DropdownMenuItem,
                        {
                          "data-ocid": link.ocid,
                          className: "cursor-pointer font-mono text-[10px] uppercase tracking-widest hover:text-slate-300 focus:text-slate-300",
                          style: { color: active ? "#f59e0b" : "#64748b" },
                          onClick: () => void navigate({ to: link.to }),
                          children: [
                            active && /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "span",
                              {
                                className: "mr-2 inline-block h-1.5 w-1.5 rounded-full",
                                style: { backgroundColor: "#f59e0b" },
                                "aria-hidden": "true"
                              }
                            ),
                            link.label
                          ]
                        },
                        link.to
                      );
                    })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                "data-ocid": "topnav.command_palette_open",
                "aria-label": "Open command palette (Ctrl+K)",
                className: "hidden items-center gap-1 rounded border px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-slate-600 transition-colors hover:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:flex",
                style: { borderColor: "#1a2235", backgroundColor: "transparent" },
                onClick: () => {
                  window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                      key: "k",
                      ctrlKey: true,
                      bubbles: true
                    })
                  );
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "⌘K" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              DropdownMenu,
              {
                onOpenChange: (open) => {
                  if (open) void refetchInbox();
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    DropdownMenuTrigger,
                    {
                      "data-ocid": "topnav.messages_dropdown.toggle",
                      className: "relative flex h-9 w-9 items-center justify-center rounded text-slate-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                      "aria-label": "Messages",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-[18px] w-[18px]" }),
                        unreadMsgCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Badge,
                          {
                            className: "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 py-0 text-[9px] font-bold",
                            style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                            children: unreadMsgCount > 99 ? "99+" : unreadMsgCount
                          }
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    DropdownMenuContent,
                    {
                      align: "end",
                      className: "w-[320px] border p-0 font-mono",
                      style: {
                        backgroundColor: "#0f1626",
                        borderColor: "#1a2235"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          {
                            className: "flex items-center justify-between border-b px-3 py-2",
                            style: { borderColor: "#1a2235" },
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400", children: "Messages" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "button",
                                {
                                  type: "button",
                                  "data-ocid": "topnav.messages_dropdown.compose_button",
                                  className: "flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-400 transition-colors hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                                  onClick: () => void navigate({
                                    to: "/messages",
                                    search: { compose: "true" }
                                  }),
                                  children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-3 w-3" }),
                                    "Compose"
                                  ]
                                }
                              )
                            ]
                          }
                        ),
                        recentInboxMessages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 py-6 text-center", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-6 w-6 text-slate-700" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-600", children: "No messages" })
                        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "max-h-[300px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-1", children: recentInboxMessages.map((msg, idx) => {
                          const isUnread = !msg.read;
                          const truncatedSubject = msg.subject.length > 40 ? `${msg.subject.slice(0, 40)}…` : msg.subject;
                          return /* @__PURE__ */ jsxRuntimeExports.jsx(
                            DropdownMenuItem,
                            {
                              "data-ocid": `topnav.messages_dropdown.item.${idx + 1}`,
                              className: "flex cursor-pointer flex-col items-start gap-0.5 px-3 py-2.5 focus:bg-white/5",
                              style: {
                                backgroundColor: isUnread ? "rgba(245,158,11,0.04)" : void 0
                              },
                              onClick: () => void navigate({ to: "/messages" }),
                              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center justify-between gap-2", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-1.5", children: [
                                  isUnread && /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "span",
                                    {
                                      className: "h-1.5 w-1.5 shrink-0 rounded-full",
                                      style: { backgroundColor: "#f59e0b" }
                                    }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "span",
                                    {
                                      className: isUnread ? "truncate font-mono text-[10px] font-bold uppercase tracking-wider text-white" : "truncate font-mono text-[10px] uppercase tracking-wider text-slate-400",
                                      children: truncatedSubject
                                    }
                                  )
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 font-mono text-[9px] text-slate-600", children: formatRelativeTime(msg.sentAt) })
                              ] })
                            },
                            msg.id
                          );
                        }) }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t", style: { borderColor: "#1a2235" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          DropdownMenuItem,
                          {
                            "data-ocid": "topnav.messages_dropdown.view_all.link",
                            className: "cursor-pointer justify-center py-2 font-mono text-[10px] uppercase tracking-widest text-amber-500 hover:text-amber-400 focus:text-amber-400",
                            onClick: () => void navigate({ to: "/messages" }),
                            children: "View all messages"
                          }
                        ) })
                      ]
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              DropdownMenu,
              {
                onOpenChange: (open) => {
                  if (open) void refetchNotifications();
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    DropdownMenuTrigger,
                    {
                      "data-ocid": "notifications.bell_button",
                      className: "relative flex h-9 w-9 items-center justify-center rounded text-slate-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                      "aria-label": "Notifications",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-[18px] w-[18px]" }),
                        unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Badge,
                          {
                            className: "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 py-0 text-[9px] font-bold",
                            style: { backgroundColor: "#f59e0b", color: "#0a0e1a" },
                            children: unreadCount > 99 ? "99+" : unreadCount
                          }
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    DropdownMenuContent,
                    {
                      "data-ocid": "notifications.dropdown_menu",
                      align: "end",
                      className: "w-[340px] border p-0 font-mono",
                      style: {
                        backgroundColor: "#0f1626",
                        borderColor: "#1a2235"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          {
                            className: "flex items-center justify-between border-b px-3 py-2",
                            style: { borderColor: "#1a2235" },
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400", children: "Notifications" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "button",
                                {
                                  type: "button",
                                  "data-ocid": "notifications.mark_all_button",
                                  className: "font-mono text-[10px] uppercase tracking-wider text-amber-400 transition-colors hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40",
                                  onClick: () => void markAllReadMutation.mutate(),
                                  disabled: markAllReadMutation.isPending || unreadCount === 0,
                                  children: "Mark all as read"
                                }
                              )
                            ]
                          }
                        ),
                        notifsFetching ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            "data-ocid": "notifications.loading_state",
                            className: "space-y-px py-1",
                            children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 px-3 py-2.5", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Skeleton,
                                {
                                  className: "h-4 w-4 shrink-0 rounded",
                                  style: { backgroundColor: "#1a2235" }
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-1.5", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Skeleton,
                                  {
                                    className: "h-2.5 w-3/4 rounded",
                                    style: { backgroundColor: "#1a2235" }
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Skeleton,
                                  {
                                    className: "h-2 w-full rounded",
                                    style: { backgroundColor: "#1a2235" }
                                  }
                                )
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Skeleton,
                                {
                                  className: "h-2 w-10 shrink-0 rounded",
                                  style: { backgroundColor: "#1a2235" }
                                }
                              )
                            ] }, i))
                          }
                        ) : notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          {
                            "data-ocid": "notifications.empty_state",
                            className: "flex flex-col items-center gap-2 py-8 text-center",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-6 w-6 text-slate-700" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-600", children: "No notifications" })
                            ]
                          }
                        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "max-h-[360px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-1", children: notifications.map((notif, idx) => {
                          const isUnread = !notif.read;
                          const isAnomaly = notif.notificationType === "anomaly_detected";
                          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            DropdownMenuItem,
                            {
                              "data-ocid": `notifications.item.${idx + 1}`,
                              className: "flex cursor-pointer items-start gap-3 px-3 py-2.5 focus:bg-white/5",
                              style: {
                                backgroundColor: isUnread ? "rgba(245,158,11,0.05)" : void 0,
                                borderLeft: isAnomaly ? "2px solid #f59e0b" : "2px solid transparent",
                                opacity: notif.read ? 0.6 : 1,
                                transition: "opacity 0.2s ease"
                              },
                              onClick: () => {
                                if (isUnread) {
                                  void markReadMutation.mutate(notif.id);
                                }
                              },
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 shrink-0", children: getNotificationIcon(notif.notificationType) }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "p",
                                    {
                                      className: `truncate font-mono text-[10px] uppercase tracking-wider ${isUnread ? "font-bold text-white" : "font-medium text-slate-400"}`,
                                      children: notif.title
                                    }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 line-clamp-2 font-mono text-[10px] leading-relaxed text-slate-500", children: notif.body })
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 shrink-0 font-mono text-[9px] text-slate-600", children: formatRelativeTime(notif.createdAt) })
                              ]
                            },
                            notif.id
                          );
                        }) }) })
                      ]
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                DropdownMenuTrigger,
                {
                  "data-ocid": "topnav.user_dropdown.toggle",
                  className: "ml-1 flex items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Avatar,
                      {
                        className: "h-7 w-7 border",
                        style: { borderColor: "#1a2235" },
                        children: [
                          (profile == null ? void 0 : profile.avatarUrl) ? /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: profile.avatarUrl, alt: profile.name }) : null,
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            AvatarFallback,
                            {
                              className: "font-mono text-[10px] font-bold",
                              style: { backgroundColor: "#1a2235", color: "#f59e0b" },
                              children: initials
                            }
                          )
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden max-w-[120px] truncate font-mono text-[10px] uppercase tracking-wider text-slate-400 sm:block", children: displayName })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                DropdownMenuContent,
                {
                  align: "end",
                  className: "min-w-[160px] border font-mono",
                  style: {
                    backgroundColor: "#0f1626",
                    borderColor: "#1a2235"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      DropdownMenuItem,
                      {
                        "data-ocid": "topnav.profile.open_modal_button",
                        className: "cursor-pointer font-mono text-xs uppercase tracking-widest text-slate-300 hover:text-white focus:text-white",
                        onClick: () => setProfileSheetOpen(true),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "mr-2 h-3.5 w-3.5" }),
                          "My Profile"
                        ]
                      }
                    ),
                    isS2Admin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      DropdownMenuItem,
                      {
                        "data-ocid": "topnav.admin_panel.link",
                        className: "cursor-pointer font-mono text-xs uppercase tracking-widest text-amber-400 hover:text-amber-300 focus:text-amber-300",
                        onClick: () => void navigate({ to: "/admin" }),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "mr-2 h-3.5 w-3.5" }),
                          "Admin Panel"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      DropdownMenuItem,
                      {
                        "data-ocid": "topnav.request_unit_access.open_modal_button",
                        className: "cursor-pointer font-mono text-xs uppercase tracking-widest text-slate-300 hover:text-white focus:text-white",
                        onClick: () => setRequestUnitOpen(true),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "mr-2 h-3.5 w-3.5" }),
                          "Request Unit Access"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, { style: { backgroundColor: "#1a2235" } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      DropdownMenuItem,
                      {
                        "data-ocid": "topnav.signout.button",
                        className: "cursor-pointer font-mono text-xs uppercase tracking-widest text-red-400 hover:text-red-300 focus:text-red-300",
                        onClick: handleSignOut,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "mr-2 h-3.5 w-3.5" }),
                          "Sign Out"
                        ]
                      }
                    )
                  ]
                }
              )
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: requestUnitOpen, onOpenChange: setRequestUnitOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      DialogContent,
      {
        "data-ocid": "topnav.request_unit_access.dialog",
        className: "border-border bg-card sm:max-w-md",
        style: { backgroundColor: "#0f1626", borderColor: "#1a2235" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-sm uppercase tracking-wider text-white", children: "Request Access to Another Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "font-mono text-xs text-slate-400", children: "Enter the UIC or organization name of the unit you want to access. The unit's S2 administrator will review your request." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label$1, { className: "font-mono text-[10px] uppercase tracking-wider text-slate-400", children: "UIC or Organization Name *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "data-ocid": "topnav.request_unit_access.input",
                  value: requestUnitId,
                  onChange: (e) => setRequestUnitId(e.target.value),
                  placeholder: "UIC (e.g. WH9RT0) or Organization Name",
                  className: "border bg-[#0a111f] font-mono text-sm text-white",
                  style: { borderColor: "#1a2235" }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label$1, { className: "font-mono text-[10px] uppercase tracking-wider text-slate-400", children: "Reason (optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  value: requestUnitReason,
                  onChange: (e) => setRequestUnitReason(e.target.value),
                  placeholder: "Reason for access request (optional)",
                  rows: 3,
                  className: "border bg-[#0a111f] font-mono text-xs text-white resize-none",
                  style: { borderColor: "#1a2235" }
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                className: "border-border font-mono text-xs uppercase tracking-wider",
                onClick: () => {
                  setRequestUnitOpen(false);
                  setRequestUnitId("");
                  setRequestUnitReason("");
                },
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                "data-ocid": "topnav.request_unit_access.submit_button",
                disabled: !requestUnitId.trim(),
                className: "bg-amber-500 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 disabled:opacity-40",
                onClick: () => {
                  ue.success(
                    "Access request submitted. The unit’s S2 will be notified.",
                    {
                      description: `Request for: ${requestUnitId}`
                    }
                  );
                  setRequestUnitOpen(false);
                  setRequestUnitId("");
                  setRequestUnitReason("");
                },
                children: "Submit Request"
              }
            )
          ] })
        ]
      }
    ) })
  ] });
}
export {
  Avatar as A,
  ExternalLink as E,
  Item as I,
  Lock as L,
  Root$1 as R,
  ScrollArea as S,
  TopNav as T,
  Upload as U,
  Textarea as a,
  SquarePen as b,
  useStorageClient as c,
  Skeleton as d,
  formatDate as e,
  formatRelativeTime as f,
  formatDateTime as g,
  getInitials$1 as h,
  AvatarImage as i,
  AvatarFallback as j,
  createRovingFocusGroupScope as k,
  useMutation as u
};
