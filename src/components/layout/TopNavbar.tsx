import { Bell, Search, Menu, LayoutDashboard, Users, CalendarClock, Calendar, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CheckInTimer } from "./CheckInTimer";
import { useHR } from "@/context/HRContext";
import { cn } from "@/lib/utils";
import { NavLink as RouterNavLink } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, adminOnly: false },
  { title: "Employees", url: "/employees", icon: Users, adminOnly: true },
  { title: "Attendance", url: "/attendance", icon: CalendarClock, adminOnly: false },
  { title: "Calendar", url: "/calendar", icon: Calendar, adminOnly: false },
  { title: "Time Off", url: "/time-off", icon: CalendarClock, adminOnly: false },
  { title: "Settings", url: "/settings", icon: Settings, adminOnly: true },
];

export function TopNavbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, notifications } = useHR();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/employees") return "Employee Directory";
    if (path.startsWith("/employees/")) return "Employee Profile";
    if (path === "/attendance") return "Attendance";
    if (path === "/time-off") return "Time Off";
    if (path === "/profile") return "My Profile";
    return "Dayflow HRMS";
  };

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return `${first}${last}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background px-6 shadow-sm">

      {/* Mobile Menu Trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px] sm:w-[300px]">
          <SheetHeader className="mb-6 text-left">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
                {settings?.companyLogoUrl ? (
                  <img src={settings.companyLogoUrl} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-bold text-sm">
                    {settings?.companyName ? settings.companyName.charAt(0) : "D"}
                  </div>
                )}
              </div>
              <SheetTitle className="text-lg font-bold">{settings?.companyName || "Dayflow"}</SheetTitle>
            </div>
          </SheetHeader>
          <nav className="flex flex-col gap-2">
            {mainNavItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              return (
                <SheetClose asChild key={item.title}>
                  <RouterNavLink
                    to={item.url}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground font-medium"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.title}</span>
                  </RouterNavLink>
                </SheetClose>
              );
            })}
            <div className="my-2 border-t border-border" />
            <SheetClose asChild>
              <div onClick={logout} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive cursor-pointer">
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Sign Out</span>
              </div>
            </SheetClose>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Logo (Desktop) */}
      <div className="hidden md:flex items-center gap-3 mr-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden">
          {settings?.companyLogoUrl ? (
            <img src={settings.companyLogoUrl} alt="Logo" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-bold text-lg">
              {settings?.companyName ? settings.companyName.charAt(0) : "D"}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground leading-none">{settings?.companyName || "Dayflow"}</span>
          <span className="text-xs text-muted-foreground">HRMS</span>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1 mx-2">
        {mainNavItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          return (
            <RouterNavLink
              key={item.title}
              to={item.url}
              className={({ isActive }) => cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground font-medium"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </RouterNavLink>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:block relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-48 pl-9 h-9 bg-secondary border-0" // Compacter search
          />
        </div>

        <CheckInTimer />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-full bg-muted hover:bg-muted/80 transition-colors">
              <Bell className="h-6 w-6 text-foreground" />
              {notifications.length > 0 && (
                <span className="absolute top-2.5 right-3 h-2 w-2 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No new notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                  <span className={cn("font-medium", notification.type === 'error' && "text-destructive", notification.type === 'success' && "text-success")}>
                    {notification.title}
                  </span>
                  <span className="text-sm text-muted-foreground w-full truncate">
                    {notification.message}
                  </span>
                  <span className="text-xs text-muted-foreground/60 w-full text-right">
                    {notification.time ? new Date(notification.time).toLocaleDateString() : 'Just now'}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user ? getInitials(user.firstName, user.lastName) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-2">
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')} className="p-2 cursor-pointer">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/attendance')} className="p-2 cursor-pointer">
              <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>My Attendance</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="p-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
