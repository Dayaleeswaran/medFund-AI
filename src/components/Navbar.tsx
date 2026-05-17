"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Sparkles, Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";
import { Sidebar } from "@/components/Sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav = [
  { href: "/campaigns", label: "Live emergencies" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wallet", label: "Wallet" },
];

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#041326]/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/30 to-[var(--mf-neon)]/40 shadow-[0_0_24px_rgba(52,255,154,0.25)]">
            <Sparkles className="h-5 w-5 text-white" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-white">
              MediFund AI
            </p>
            <p className="text-[10px] uppercase tracking-widest text-cyan-200/80">
              emergency + wallet
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                pathname === item.href
                  ? "bg-white/15 text-white"
                  : "text-white/65 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full text-white/80 hover:text-white hover:bg-white/10">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-[var(--mf-neon)]" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 border-white/15 bg-[#071a2c]/95 backdrop-blur-xl text-white">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-0 text-xs text-white/50 hover:text-white hover:bg-transparent">
                        Mark all read
                      </Button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-white/50">No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <DropdownMenuItem 
                          key={n.id} 
                          className={cn("flex flex-col items-start gap-1 p-3 focus:bg-white/10", !n.read && "bg-white/5")}
                          onClick={() => markAsRead(n.id)}
                        >
                          <div className="flex w-full items-center justify-between">
                            <span className="font-semibold">{n.title}</span>
                            {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[var(--mf-neon)]" />}
                          </div>
                          <span className="text-xs text-white/70 line-clamp-2">{n.message}</span>
                          <span className="text-[10px] text-white/40">{new Date(n.timestamp).toLocaleTimeString()}</span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                {user.full_name || "Supporter"}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  void signOut();
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Create account</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-xl border border-white/15 p-2 text-white md:hidden"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-white/10 bg-[#041326]/95 px-4 py-4 md:hidden"
        >
          <div className="flex flex-col gap-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-white"
              >
                {item.label}
              </Link>
            ))}
            <Sidebar className="mt-2" onNavigate={() => setOpen(false)} />
            {!user ? (
              <div className="mt-2 flex gap-2">
                <Link href="/login" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button className="w-full">Sign up</Button>
                </Link>
              </div>
            ) : (
              <Button
                variant="danger"
                onClick={() => {
                  void signOut();
                }}
              >
                Sign out
              </Button>
            )}
          </div>
        </motion.div>
      ) : null}
    </header>
  );
}
