import { useState, useRef, useEffect } from "react";
import { Search, LogOut, Settings, ChevronDown, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useMode } from "@/contexts/ModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
}

const TopBar = ({ showSearch, searchValue, onSearchChange }: TopBarProps) => {
  const { mode, toggleMode, canTeach } = useMode();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { role } = useAuth();
  const displayName = profile?.full_name || "User";
  const displayRole = role === "teacher" ? "Teacher" : "Student";
  const initial = displayName.charAt(0).toUpperCase();

  const handleToggle = () => {
    if (mode === "student") {
      toggleMode();
      navigate("/teacher/courses");
    } else {
      toggleMode();
      navigate("/dashboard");
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate("/auth");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-3 flex-1">
        <SidebarTrigger />
        {showSearch && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for a course"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {mode === "teacher" && (
          <button onClick={() => { toggleMode(); navigate("/dashboard"); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" /> Exit
          </button>
        )}
        {mode === "student" && canTeach && (
          <>
            <span className="text-sm text-muted-foreground">Teacher Mode</span>
            <Switch checked={false} onCheckedChange={handleToggle} />
          </>
        )}

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 group"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">{initial}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground capitalize">{displayRole}</p>
              </div>

              <button
                onClick={() => { setDropdownOpen(false); navigate("/settings"); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 transition-colors duration-150"
              >
                <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Settings</p>
                  <p className="text-xs text-muted-foreground">Manage your account</p>
                </div>
              </button>

              <button
                onClick={() => { setDropdownOpen(false); navigate("/profile"); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 transition-colors duration-150"
              >
                <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Profile</p>
                  <p className="text-xs text-muted-foreground">View your profile</p>
                </div>
              </button>

              <div className="border-t border-border" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors duration-150"
              >
                <div className="w-8 h-8 rounded-md bg-destructive/10 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-destructive" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Logout</p>
                  <p className="text-xs text-destructive/70">Sign out of your account</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
