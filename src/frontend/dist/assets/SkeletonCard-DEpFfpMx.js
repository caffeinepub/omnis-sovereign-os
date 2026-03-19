import { j as jsxRuntimeExports, e as cn } from "./index-BlEGMROs.js";
import { d as Skeleton } from "./TopNav-D8UQSmDX.js";
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
