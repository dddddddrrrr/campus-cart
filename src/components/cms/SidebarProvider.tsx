"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "~/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ShoppingBag,
  Users,
  BarChart3,
  Tag,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useRouter } from "next/navigation";

type SidebarContextType = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined,
);

export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

interface SidebarProviderProps {
  children: React.ReactNode;
}

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  // Initialize from localStorage if available, otherwise default to false (expanded)
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);

  // Load sidebar state from localStorage on component mount
  React.useEffect(() => {
    const storedState = localStorage.getItem("cms-sidebar-collapsed");
    if (storedState !== null) {
      setIsCollapsed(storedState === "true");
    }
  }, []);

  // Update localStorage when sidebar state changes
  const toggleSidebar = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("cms-sidebar-collapsed", String(newState));
      return newState;
    });
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </SidebarContext.Provider>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

const NavItem = ({ icon, label, href, isActive }: NavItemProps) => {
  const { isCollapsed } = useSidebar();

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center">
              {icon}
            </span>
            {!isCollapsed && <span>{label}</span>}
          </Link>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const navItems = [
    {
      icon: <LayoutDashboard size={18} />,
      label: "仪表盘",
      href: "/cms",
    },
    {
      icon: <ShoppingBag size={18} />,
      label: "商品管理",
      href: "/cms/products",
    },
    {
      icon: <Tag size={18} />,
      label: "分类管理",
      href: "/cms/categories",
    },
    {
      icon: <Users size={18} />,
      label: "用户管理",
      href: "/cms/user",
    },
    {
      icon: <BarChart3 size={18} />,
      label: "销售统计",
      href: "/cms/analytics",
    },
  ];

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[240px]",
      )}
    >
      <div className="flex h-14 items-center border-b px-3">
        <div className="cursor-pointer" onClick={() => router.push("/")}>
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">校园购物后台</h2>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn("ml-auto h-8 w-8", isCollapsed && "mx-auto")}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={pathname === item.href}
          />
        ))}
      </nav>
    </aside>
  );
};

export default SidebarProvider;
