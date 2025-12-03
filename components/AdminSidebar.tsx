"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  ChevronLeft,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="font-semibold text-gray-900">Opus&Oak</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1 rounded-md hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {user.firstName[0]}
              {user.lastName[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Store
          </Link>
          <button
            onClick={() => {
              document.cookie = "accessToken=; Max-Age=0; path=/";
              document.cookie = "refreshToken=; Max-Age=0; path=/";
              window.location.href = "/auth";
            }}
            className="flex items-center justify-center p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white flex flex-col">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex lg:flex-col lg:bg-white lg:border-r lg:border-gray-200">
        <SidebarContent />
      </div>
    </>
  );
}
