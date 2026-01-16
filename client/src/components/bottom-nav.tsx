import { Link, useLocation } from "wouter";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "홈" },
  { path: "/activities", icon: Search, label: "탐색" },
  { path: "/activities/new", icon: PlusCircle, label: "모집" },
  { path: "/chat", icon: MessageCircle, label: "채팅" },
  { path: "/profile", icon: User, label: "프로필" },
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
                className={`flex flex-col items-center gap-1 py-2 px-4 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid={`nav-${item.label}`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
