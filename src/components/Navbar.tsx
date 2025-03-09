"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import {
  SearchIcon,
  ShoppingBagIcon,
  MenuIcon,
  UserIcon,
  X,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useIsMobile } from "~/hooks/use-mobile";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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
          <span className="text-primary">Campus</span>
          <span>Market</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/categories"
              className="font-medium transition-colors hover:text-primary"
            >
              Categories
            </Link>
            <Link
              href="/deals"
              className="font-medium transition-colors hover:text-primary"
            >
              Today&apos;s Deals
            </Link>
            <Link
              href="/new"
              className="font-medium transition-colors hover:text-primary"
            >
              New Arrivals
            </Link>
            <Link
              href="/sell"
              className="font-medium transition-colors hover:text-primary"
            >
              Sell
            </Link>
          </nav>
        )}

        {/* Search and Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {!isMobile && (
            <div className="relative hidden items-center md:flex">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-[180px] rounded-full border-none bg-secondary/50 py-2 pl-9 pr-4 focus:bg-white lg:w-[280px]"
              />
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            </div>
          )}

          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/cart">
              <ShoppingBagIcon className="h-5 w-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/profile">
              <UserIcon className="h-5 w-5" />
            </Link>
          </Button>

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
                <span className="text-primary">Campus</span>
                <span>Market</span>
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
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full rounded-full border-none bg-secondary/50 py-2 pl-9 pr-4 focus:bg-white"
              />
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            </div>

            <nav className="flex flex-col gap-6 text-lg">
              <Link
                href="/categories"
                className="py-2 font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/deals"
                className="py-2 font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Today&apos;s Deals
              </Link>
              <Link
                href="/new"
                className="py-2 font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                New Arrivals
              </Link>
              <Link
                href="/sell"
                className="py-2 font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sell
              </Link>
              <Link
                href="/cart"
                className="py-2 font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cart
              </Link>
              <Link
                href="/profile"
                className="py-2 font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
