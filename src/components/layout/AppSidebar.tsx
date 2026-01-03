import { 
  LayoutDashboard, 
  Users, 
  CalendarClock, 
  Calendar,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, adminOnly: false },
  { title: "Employees", url: "/employees", icon: Users, adminOnly: true },
  { title: "Attendance", url: "/attendance", icon: CalendarClock, adminOnly: false },
  { title: "Time Off", url: "/time-off", icon: Calendar, adminOnly: false },
  { title: "Settings", url: "/settings", icon: Settings, adminOnly: true },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">D</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-foreground">Dayflow</span>
              <span className="text-xs text-muted-foreground">HRMS</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Main Menu</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                // Hide admin-only items from non-admin users
                if (item.adminOnly && !isAdmin) return null;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink 
                        to={item.url} 
                        end={item.url === "/dashboard"}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        activeClassName="bg-accent text-accent-foreground font-medium"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Account</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="My Profile">
                  <NavLink 
                    to="/profile"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <User className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>My Profile</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Separator className="mb-4" />
        
        {user && (
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} mb-3`}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-foreground truncate">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user.jobTitle}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 shrink-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          {!collapsed && (
            <Button 
              variant="ghost" 
              className="flex-1 justify-start gap-2 text-muted-foreground hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          )}
          {collapsed && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={logout}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
