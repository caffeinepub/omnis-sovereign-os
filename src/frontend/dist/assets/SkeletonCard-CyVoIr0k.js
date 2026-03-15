import { j as jsxRuntimeExports, d as cn } from "./index-3JmW1yt2.js";
import { c as Skeleton } from "./TopNav-DiCFNdIt.js";
function SkeletonCard({ width, height, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Skeleton,
    {
      "data-ocid": "skeleton.loading_state",
      className: cn("rounded-md bg-muted", className),
      style: { width, height }
    }
  );
}
export {
  SkeletonCard as S
};
