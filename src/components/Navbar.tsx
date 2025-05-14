"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { ShoppingBagIcon, MenuIcon, UserIcon, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useIsMobile } from "~/hooks/use-mobile";
import { signOut, useSession } from "next-auth/react";
import { LoginDialog } from "~/components/LoginDialog";
import { SignUpDialog } from "~/components/SignUpDialog";
import { SearchBar } from "~/components/SearchBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Image from "next/image";
import { api } from "~/trpc/react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { data: session } = useSession();
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);

  const { data: credit } = api.user.fetchUserCredit.useQuery(undefined, {
    enabled: !!session,
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  // Handler for opening login and closing signup
  const handleOpenLogin = () => {
    setOpenLogin(true);
    setOpenSignUp(false);
  };

  // Handler for opening signup and closing login
  const handleOpenSignUp = () => {
    setOpenSignUp(true);
    setOpenLogin(false);
  };

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 px-4 py-3 transition-all duration-300 ease-in-out md:px-6",
        isScrolled
          ? "bg-glass border-b border-gray-100 shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-semibold tracking-tight"
        >
          <span className="text-primary">校园</span>
          <span>超市</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/category"
              className="font-medium transition-colors hover:text-primary"
            >
              分类
            </Link>
            <Link
              href="/deals"
              className="font-medium transition-colors hover:text-primary"
            >
              今日特惠
            </Link>
            <Link
              href="/new"
              className="font-medium transition-colors hover:text-primary"
            >
              新品
            </Link>
          </nav>
        )}

        {/* Search and Actions */}
        <div className="flex items-center">
          {!isMobile && (
            <>
              <div className="relative hidden items-center gap-4 md:flex">
                <SearchBar />
                {session && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    asChild
                  >
                    <Link href="/cart">
                      <ShoppingBagIcon className="h-5 w-5" />
                    </Link>
                  </Button>
                )}
              </div>

              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 rounded-full px-2 py-1"
                    >
                      {session.user?.image ? (
                        <div className="h-8 w-8 overflow-hidden rounded-full border">
                          <Image
                            src={session.user.image}
                            alt={session.user.name || "用户头像"}
                            fill
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <UserIcon className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <span className="hidden max-w-[100px] truncate text-sm font-medium md:inline">
                        {session.user?.name || "用户"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 border-b p-2">
                      {session.user?.image ? (
                        <div className="h-10 w-10 overflow-hidden rounded-full border">
                          <Image
                            src={session.user.image}
                            alt={session.user.name || "用户头像"}
                            fill
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <UserIcon className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {session.user?.name || "用户"}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-primary">
                              {credit}
                            </span>
                          </div>
                        </div>
                        {session.user?.email && (
                          <p className="truncate text-xs text-muted-foreground">
                            {session.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        个人中心
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        await signOut();
                      }}
                      className="cursor-pointer"
                    >
                      退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-4">
                  <Button onClick={handleOpenLogin}>登录</Button>
                  <Button variant="outline" onClick={handleOpenSignUp}>
                    注册
                  </Button>
                </div>
              )}
            </>
          )}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden"
              onClick={toggleMobileMenu}
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 z-50 bg-white transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "visible opacity-100" : "invisible opacity-0",
          )}
        >
          <div className="flex h-full flex-col p-6">
            <div className="mb-8 flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-semibold tracking-tight"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-primary">校园</span>
                <span>超市</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={toggleMobileMenu}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="relative mb-6">
              <SearchBar />
            </div>

            <nav className="flex flex-col gap-6 text-lg">
              <Link
                href="/categories"
                className="py-2 font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                分类
              </Link>
              <Link
                href="/deals"
                className="py-2 font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                今日特惠
              </Link>
              <Link
                href="/new"
                className="py-2 font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                新品
              </Link>

              <Link
                href="/cart"
                className="py-2 font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                购物车
              </Link>
              {session ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 py-2">
                    {session.user?.image ? (
                      <div className="h-10 w-10 overflow-hidden rounded-full border">
                        <img
                          src={session.user.image}
                          alt={session.user.name || "用户头像"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <UserIcon className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {session.user?.name || "用户"}
                      </p>
                      {session.user?.email && (
                        <p className="text-sm text-muted-foreground">
                          {session.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-primary">余额</span>
                    <span className="font-medium text-primary">{credit}</span>
                  </div>
                  <Link
                    href="/profile"
                    className="py-2 font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    个人中心
                  </Link>
                  <Button
                    variant="outline"
                    className="py-2 font-medium transition-colors hover:text-primary"
                    onClick={async () => {
                      await signOut();
                    }}
                  >
                    退出登录
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="py-2 font-medium transition-colors hover:text-primary"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleOpenLogin();
                    }}
                  >
                    登录
                  </Button>
                  <Button
                    className="py-2 font-medium transition-colors hover:text-primary"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleOpenSignUp();
                    }}
                  >
                    注册
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Auth Dialogs */}
      <LoginDialog
        open={openLogin}
        setOpen={setOpenLogin}
        onRegisterClick={handleOpenSignUp}
      />
      <SignUpDialog
        open={openSignUp}
        setOpen={setOpenSignUp}
        onLoginClick={handleOpenLogin}
      />
    </header>
  );
}
