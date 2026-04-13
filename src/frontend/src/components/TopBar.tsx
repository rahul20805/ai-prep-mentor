import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouterState } from "@tanstack/react-router";
import { format } from "date-fns";
import { Bell, Moon, Sun } from "lucide-react";
import { SidebarToggle } from "./Sidebar";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Your study overview for today",
  },
  "/timetable": {
    title: "Timetable",
    subtitle: "Weekly schedule & task management",
  },
  "/practice": {
    title: "PYQ Practice",
    subtitle: "Previous year questions with adaptive difficulty",
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Performance trends and subject breakdown",
  },
  "/mentor": {
    title: "AI Mentor",
    subtitle: "Personalized study advice and plan generation",
  },
  "/lectures": {
    title: "Lectures",
    subtitle: "Curated YouTube lectures for NEET / JEE",
  },
};

type TopBarProps = {
  onMenuClick: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
};

export function TopBar({ onMenuClick, darkMode, onToggleDark }: TopBarProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const pageInfo = PAGE_TITLES[pathname] ?? {
    title: "AI Prep Mentor",
    subtitle: "",
  };
  const today = format(new Date(), "EEEE, dd MMM yyyy");

  return (
    <header
      className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0 shadow-subtle"
      data-ocid="topbar"
    >
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3 min-w-0">
        <SidebarToggle onClick={onMenuClick} />
        <div className="min-w-0">
          <h1 className="font-display font-bold text-foreground text-base leading-tight truncate">
            {pageInfo.title}
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block truncate">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: date + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge
          variant="secondary"
          className="hidden md:flex text-xs font-normal"
        >
          {today}
        </Badge>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative"
          aria-label="Notifications"
          data-ocid="topbar-notifications"
        >
          <Bell size={16} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border border-card"
            aria-hidden="true"
          />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={onToggleDark}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          data-ocid="topbar-theme-toggle"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
      </div>
    </header>
  );
}
