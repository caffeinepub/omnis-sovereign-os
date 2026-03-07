import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
/**
 * CommandPalette — Global Ctrl+K / Cmd+K command palette.
 * Opens via keyboard shortcut or topnav button.
 * Lists all navigable routes, navigates on select.
 */
import { usePermissions } from "@/contexts/PermissionsContext";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  Calendar,
  CheckSquare,
  FileText,
  FolderOpen,
  Globe,
  HelpCircle,
  Layout,
  Mail,
  MessageSquare,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  s2Only?: boolean;
}

const PRIMARY_ITEMS: NavItem[] = [
  {
    label: "Documents",
    to: "/documents",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: "Messaging",
    to: "/messages",
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    label: "File Storage",
    to: "/file-storage",
    icon: <FolderOpen className="h-4 w-4" />,
  },
  {
    label: "Personnel Directory",
    to: "/personnel",
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: "Email Directory",
    to: "/email-directory",
    icon: <Mail className="h-4 w-4" />,
  },
];

const TOOLS_ITEMS: NavItem[] = [
  {
    label: "Notifications",
    to: "/notifications",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    label: "Announcements",
    to: "/announcements",
    icon: <Globe className="h-4 w-4" />,
  },
  {
    label: "Calendar",
    to: "/calendar",
    icon: <Calendar className="h-4 w-4" />,
  },
  { label: "Tasks", to: "/tasks", icon: <CheckSquare className="h-4 w-4" /> },
];

const ACCOUNT_ITEMS: NavItem[] = [
  {
    label: "My Profile",
    to: "/my-profile",
    icon: <User className="h-4 w-4" />,
  },
  {
    label: "Settings",
    to: "/settings",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    label: "Governance",
    to: "/governance",
    icon: <Layout className="h-4 w-4" />,
  },
  { label: "Help", to: "/help", icon: <HelpCircle className="h-4 w-4" /> },
];

const S2_ITEMS: NavItem[] = [
  {
    label: "Access Monitoring",
    to: "/monitoring",
    icon: <Shield className="h-4 w-4" />,
    s2Only: true,
  },
  {
    label: "Audit Log",
    to: "/audit-log",
    icon: <BookOpen className="h-4 w-4" />,
    s2Only: true,
  },
  {
    label: "Admin Panel",
    to: "/admin",
    icon: <Settings className="h-4 w-4" />,
    s2Only: true,
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isS2Admin } = usePermissions();

  useEffect(() => {
    let gPressed = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;

    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+K / Cmd+K toggles palette
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      // G → key sequence navigation (only when palette is closed and not in an input)
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "g" || e.key === "G") {
        gPressed = true;
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(() => {
          gPressed = false;
        }, 1000);
        return;
      }
      if (gPressed) {
        gPressed = false;
        if (gTimer) clearTimeout(gTimer);
        const map: Record<string, string> = {
          h: "/",
          H: "/",
          d: "/documents",
          D: "/documents",
          m: "/messages",
          M: "/messages",
          n: "/notifications",
          N: "/notifications",
        };
        if (map[e.key]) {
          e.preventDefault();
          void navigate({
            to: map[e.key] as
              | "/"
              | "/documents"
              | "/messages"
              | "/notifications",
          });
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [navigate]);

  function handleSelect(to: string) {
    setOpen(false);
    void navigate({ to });
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Search and navigate to any module"
      showCloseButton={false}
    >
      <div
        data-ocid="command_palette.dialog"
        style={{ backgroundColor: "#0f1626", color: "#e2e8f0" }}
        className="overflow-hidden rounded-lg border"
        // Style override — dialog already handles the container
      >
        <CommandInput
          data-ocid="command_palette.search_input"
          placeholder="Search modules..."
          className="border-b font-mono text-sm text-white placeholder:text-slate-600"
          style={{ borderColor: "#1a2235", backgroundColor: "#0f1626" }}
        />
        <CommandList style={{ backgroundColor: "#0f1626" }}>
          <CommandEmpty className="font-mono text-xs uppercase tracking-widest text-slate-600">
            No results found.
          </CommandEmpty>

          <CommandGroup
            heading="Modules"
            className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-slate-600"
          >
            {PRIMARY_ITEMS.map((item, i) => (
              <CommandItem
                key={item.to}
                data-ocid={`command_palette.item.${i + 1}`}
                value={item.label}
                onSelect={() => handleSelect(item.to)}
                className="cursor-pointer gap-2 font-mono text-xs uppercase tracking-wider text-slate-300 data-[selected=true]:bg-white/5 data-[selected=true]:text-white"
              >
                <span className="text-amber-500/60">{item.icon}</span>
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator style={{ backgroundColor: "#1a2235" }} />

          <CommandGroup
            heading="Tools"
            className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-slate-600"
          >
            {TOOLS_ITEMS.map((item, i) => (
              <CommandItem
                key={item.to}
                data-ocid={`command_palette.item.${PRIMARY_ITEMS.length + i + 1}`}
                value={item.label}
                onSelect={() => handleSelect(item.to)}
                className="cursor-pointer gap-2 font-mono text-xs uppercase tracking-wider text-slate-300 data-[selected=true]:bg-white/5 data-[selected=true]:text-white"
              >
                <span className="text-amber-500/60">{item.icon}</span>
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator style={{ backgroundColor: "#1a2235" }} />

          <CommandGroup
            heading="Account"
            className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-slate-600"
          >
            {ACCOUNT_ITEMS.map((item, i) => (
              <CommandItem
                key={item.to}
                data-ocid={`command_palette.item.${PRIMARY_ITEMS.length + TOOLS_ITEMS.length + i + 1}`}
                value={item.label}
                onSelect={() => handleSelect(item.to)}
                className="cursor-pointer gap-2 font-mono text-xs uppercase tracking-wider text-slate-300 data-[selected=true]:bg-white/5 data-[selected=true]:text-white"
              >
                <span className="text-amber-500/60">{item.icon}</span>
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          {isS2Admin && (
            <>
              <CommandSeparator style={{ backgroundColor: "#1a2235" }} />
              <CommandGroup
                heading="S2 Admin"
                className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-amber-600"
              >
                {S2_ITEMS.map((item, i) => (
                  <CommandItem
                    key={item.to}
                    data-ocid={`command_palette.item.${PRIMARY_ITEMS.length + TOOLS_ITEMS.length + ACCOUNT_ITEMS.length + i + 1}`}
                    value={item.label}
                    onSelect={() => handleSelect(item.to)}
                    className="cursor-pointer gap-2 font-mono text-xs uppercase tracking-wider text-amber-400/80 data-[selected=true]:bg-white/5 data-[selected=true]:text-amber-300"
                  >
                    <span className="text-amber-500/60">{item.icon}</span>
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>

        {/* Footer shortcut hint */}
        <div
          className="flex items-center justify-end border-t px-3 py-2"
          style={{ borderColor: "#1a2235" }}
        >
          <span className="font-mono text-[9px] uppercase tracking-widest text-slate-700">
            ↵ Select · Esc Close
          </span>
        </div>
      </div>
    </CommandDialog>
  );
}
