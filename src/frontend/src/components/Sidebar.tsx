import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  PlaySquare,
  X,
} from "lucide-react";

type NavLink = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

const NAV_LINKS: NavLink[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  { label: "Timetable", path: "/timetable", icon: <Calendar size={18} /> },
  { label: "Practice", path: "/practice", icon: <BookOpen size={18} /> },
  { label: "Analytics", path: "/analytics", icon: <BarChart3 size={18} /> },
  { label: "AI Mentor", path: "/mentor", icon: <MessageCircle size={18} /> },
  { label: "Lectures", path: "/lectures", icon: <PlaySquare size={18} /> },
];

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { identity, clear } = useInternetIdentity();
  const navigate = useNavigate();

  // Truncate principal for display
  const principalText = identity ? identity.getPrincipal().toText() : "";
  const displayId =
    principalText.length > 16
      ? `${principalText.slice(0, 8)}…${principalText.slice(-5)}`
      : principalText;

  // Avatar initials from principal
  const avatarInitials =
    principalText.length >= 2 ? principalText.slice(0, 2).toUpperCase() : "AI";

  const handleLogout = () => {
    clear();
    navigate({ to: "/login" });
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-sidebar flex flex-col
          border-r border-sidebar-border shadow-elevated
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto lg:shadow-none
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <GraduationCap size={20} className="text-accent-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-sidebar-foreground text-sm leading-tight truncate">
              AI Prep Mentor
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">
              NEET / JEE 2025
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden ml-auto text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-border/30 h-8 w-8"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </Button>
        </div>

        {/* User Profile */}
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sidebar-primary/20 border border-sidebar-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sidebar-primary font-display font-bold text-sm">
                {avatarInitials}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                My Account
              </p>
              {displayId && (
                <p
                  className="text-xs text-sidebar-foreground/50 truncate font-mono"
                  title={principalText}
                  data-ocid="user-principal"
                >
                  {displayId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.path ||
              (pathname === "/" && link.path === "/dashboard");
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                data-ocid={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-smooth group
                  ${
                    isActive
                      ? "bg-accent text-accent-foreground shadow-xs"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-border/40 hover:text-sidebar-foreground"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`flex-shrink-0 ${isActive ? "text-accent-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"}`}
                >
                  {link.icon}
                </span>
                {link.label}
                {link.label === "AI Mentor" && (
                  <span
                    className="ml-auto w-2 h-2 rounded-full bg-accent/70 animate-pulse"
                    aria-label="Active"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout + Footer */}
        <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 h-9 px-3 text-sm transition-smooth"
            onClick={handleLogout}
            data-ocid="logout-btn"
            aria-label="Logout"
          >
            <LogOut size={16} className="flex-shrink-0" />
            Sign out
          </Button>
          <p className="text-xs text-sidebar-foreground/30 text-center">
            © {new Date().getFullYear()} •{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-sidebar-foreground/60 transition-fast"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </aside>
    </>
  );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden h-9 w-9"
      onClick={onClick}
      aria-label="Open sidebar"
    >
      <Menu size={18} />
    </Button>
  );
}
