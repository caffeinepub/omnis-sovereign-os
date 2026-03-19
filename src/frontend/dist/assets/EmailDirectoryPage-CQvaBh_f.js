import { c as useExtActor, a as useInternetIdentity, r as reactExports, a3 as useQuery, j as jsxRuntimeExports, k as Mail } from "./index-BlEGMROs.js";
import { T as TopNav } from "./TopNav-D8UQSmDX.js";
import { E as EmptyState } from "./EmptyState-0-AYWQ3I.js";
import { S as SkeletonCard } from "./SkeletonCard-DEpFfpMx.js";
import { B as Breadcrumb, a as BreadcrumbList, b as BreadcrumbItem, c as BreadcrumbLink, d as BreadcrumbSeparator, e as BreadcrumbPage } from "./breadcrumb-CXZKGbs0.js";
import { I as Input } from "./displayName-Dizd79pw.js";
import "./constants-O6cGduIW.js";
import "./chevron-right-D4lTJ-EH.js";
import "./check-BXhHek9h.js";
const TABLE_SKELETON_IDS = ["a", "b", "c", "d", "e"];
function TableSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { "data-ocid": "email_directory.loading_state", children: TABLE_SKELETON_IDS.map((id) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", style: { borderColor: "#1a2235" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "12px", width: "160px" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "12px", width: "80px" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "12px", width: "200px" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, { height: "12px", width: "120px" }) })
  ] }, id)) });
}
function EmailDirectoryPage() {
  const { actor, isFetching } = useExtActor();
  const { identity } = useInternetIdentity();
  const [inputValue, setInputValue] = reactExports.useState("");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const searchDebounceRef = reactExports.useRef(null);
  function handleSearchChange(val) {
    setInputValue(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(val);
    }, 200);
  }
  const principalStr = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "anon";
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: [principalStr, "email-directory-profiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching
  });
  const filteredProfiles = reactExports.useMemo(() => {
    if (!searchQuery) return profiles;
    const q = searchQuery.toLowerCase();
    return profiles.filter(
      (p) => p.name.toLowerCase().includes(q) || p.orgRole.toLowerCase().includes(q)
    );
  }, [profiles, searchQuery]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "email_directory.page",
      className: "flex min-h-screen flex-col",
      style: { backgroundColor: "#0a0e1a" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TopNav, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "nav",
          {
            className: "border-b px-6 py-2.5",
            style: { borderColor: "#1a2235", backgroundColor: "#0a0e1a" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Breadcrumb, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BreadcrumbList, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                BreadcrumbLink,
                {
                  href: "/",
                  className: "font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300",
                  children: "Hub"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbSeparator, { className: "text-slate-700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadcrumbPage, { className: "font-mono text-[10px] uppercase tracking-widest text-slate-400", children: "Email Directory" }) })
            ] }) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-5 w-5 text-amber-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold uppercase tracking-[0.2em] text-white", children: "Email Directory" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600", children: isLoading ? "Loading..." : `${filteredProfiles.length} of ${profiles.length} contacts` })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "data-ocid": "email_directory.search_input",
              value: inputValue,
              onChange: (e) => handleSearchChange(e.target.value),
              placeholder: "Search by name or role...",
              className: "max-w-sm border font-mono text-xs text-white placeholder:text-slate-600",
              style: { backgroundColor: "#1a2235", borderColor: "#2a3347" }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "overflow-hidden rounded border",
              style: { borderColor: "#1a2235" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full table-auto", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "tr",
                  {
                    className: "border-b",
                    style: {
                      backgroundColor: "#0f1626",
                      borderColor: "#1a2235"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500", children: "Name" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500", children: "Rank" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500", children: "Email" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500", children: "Role" })
                    ]
                  }
                ) }),
                isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableSkeleton, {}) : filteredProfiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "email_directory.empty_state", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  EmptyState,
                  {
                    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, {}),
                    message: "No contacts found",
                    className: "py-16"
                  }
                ) }) }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredProfiles.map((profile, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "tr",
                  {
                    "data-ocid": `email_directory.row.${idx + 1}`,
                    className: "border-b transition-colors last:border-b-0 hover:bg-white/[0.025]",
                    style: { borderColor: "#1a2235" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-semibold text-white", children: profile.name || "—" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-slate-400", children: profile.rank || "—" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: profile.email ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "a",
                        {
                          href: `mailto:${profile.email}`,
                          className: "font-mono text-xs text-amber-400 underline-offset-2 hover:text-amber-300 hover:underline",
                          children: profile.email
                        }
                      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-slate-600", children: "—" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-slate-500", children: profile.orgRole || "—" }) })
                    ]
                  },
                  profile.principalId.toString()
                )) })
              ] })
            }
          )
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
  EmailDirectoryPage as default
};
