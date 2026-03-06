/**
 * RankSelector — Three independent dropdowns: Branch, Category, Rank
 * All three visible simultaneously. Category filters by branch, rank filters by both.
 */
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BRANCH_LIST,
  getCategoriesForBranch,
  getRanks,
} from "@/config/constants";

interface RankSelectorProps {
  branch: string;
  category: string;
  rank: string;
  onBranchChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onRankChange: (v: string) => void;
  disabled?: boolean;
  /** Style variant: 'registration' uses lighter bg, 'modal' uses darker bg */
  variant?: "registration" | "modal";
}

export function RankSelector({
  branch,
  category,
  rank,
  onBranchChange,
  onCategoryChange,
  onRankChange,
  disabled = false,
  variant = "registration",
}: RankSelectorProps) {
  const categories = branch ? getCategoriesForBranch(branch) : [];
  const ranks = branch && category ? getRanks(branch, category) : [];

  const inputStyle =
    variant === "registration"
      ? { backgroundColor: "#1a2235", borderColor: "#243048" }
      : { backgroundColor: "#1a2235", borderColor: "#2a3347" };

  const contentStyle = { backgroundColor: "#0f1626", borderColor: "#1a2235" };

  const labelClass =
    variant === "registration"
      ? "font-mono text-xs uppercase tracking-wider text-muted-foreground"
      : "font-mono text-[10px] uppercase tracking-widest text-slate-400";

  return (
    <div className="space-y-3">
      {/* Branch */}
      <div className="space-y-1.5">
        <Label className={labelClass}>Branch / Organization</Label>
        <Select
          value={branch}
          onValueChange={(v) => {
            onBranchChange(v);
            onCategoryChange("");
            onRankChange("");
          }}
          disabled={disabled}
        >
          <SelectTrigger
            data-ocid="rank_selector.branch.select"
            className="border font-mono text-sm text-foreground focus:border-primary focus:ring-primary"
            style={inputStyle}
          >
            <SelectValue placeholder="Select branch or org type…" />
          </SelectTrigger>
          <SelectContent style={contentStyle}>
            {BRANCH_LIST.map((b) => (
              <SelectItem key={b} value={b} className="font-mono text-sm">
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label className={labelClass}>Category</Label>
        <Select
          value={category}
          onValueChange={(v) => {
            onCategoryChange(v);
            onRankChange("");
          }}
          disabled={disabled || !branch}
        >
          <SelectTrigger
            data-ocid="rank_selector.category.select"
            className="border font-mono text-sm text-foreground focus:border-primary focus:ring-primary"
            style={inputStyle}
          >
            <SelectValue
              placeholder={branch ? "Select category…" : "Select branch first"}
            />
          </SelectTrigger>
          <SelectContent style={contentStyle}>
            {categories.map((c) => (
              <SelectItem key={c} value={c} className="font-mono text-sm">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rank */}
      <div className="space-y-1.5">
        <Label className={labelClass}>Rank / Title</Label>
        <Select
          value={rank}
          onValueChange={onRankChange}
          disabled={disabled || !category}
        >
          <SelectTrigger
            data-ocid="rank_selector.rank.select"
            className="border font-mono text-sm text-foreground focus:border-primary focus:ring-primary"
            style={inputStyle}
          >
            <SelectValue
              placeholder={
                category ? "Select rank or title…" : "Select category first"
              }
            />
          </SelectTrigger>
          <SelectContent style={contentStyle}>
            {ranks.map((r) => (
              <SelectItem key={r} value={r} className="font-mono text-sm">
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
