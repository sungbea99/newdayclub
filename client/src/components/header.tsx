import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Users, Bell, Home, Compass, MessageCircle, User, LogOut, Settings } from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "홈" },
    { path: "/activities", icon: Compass, label: "동행 찾기" },
    { path: "/chat", icon: MessageCircle, label: "채팅" },
    { path: "/community", icon: Users, label: "커뮤니티" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground hidden sm:block">동락</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.path || 
                (item.path !== "/" && location.startsWith(item.path));
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button 
                    variant={isActive ? "secondary" : "ghost"}
                    className="gap-2"
                    data-testid={`nav-desktop-${item.label}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "사용자"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.firstName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>내 프로필</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/edit" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>프로필 편집</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive"
                  onClick={() => logout()}
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
