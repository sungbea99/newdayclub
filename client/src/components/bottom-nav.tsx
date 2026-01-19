import { Link, useLocation } from "wouter";
import { Home, Users, MessageCircle, Compass, User } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "홈" },
  { path: "/activities", icon: Compass, label: "동행 찾기" },
  { path: "/chat", icon: MessageCircle, label: "채팅" },
  { path: "/community", icon: Users, label: "커뮤니티" },
  { path: "/profile", icon: User, label: "MY" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location === item.path || 
            (item.path !== "/" && location.startsWith(item.path));
          
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={`flex flex-col items-center gap-0.5 py-2 px-1 min-w-0 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid={`nav-${item.label}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
