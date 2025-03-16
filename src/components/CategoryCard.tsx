"use client";

import Link from "next/link";
import { cn } from "~/lib/utils";

interface CategoryCardProps {
  id: number;
  name: string;
  icon: React.ReactNode;
  count: number;
  color?: string;
}

export function CategoryCard({
  id,
  name,
  icon,
  count,
  color = "bg-blue-50",
}: CategoryCardProps) {
  return (
    <Link
      href={`/category/${id}`}
      className="group transition-all duration-300 hover:shadow-md"
    >
      <div className="flex flex-col items-center rounded-xl border bg-white p-4 transition-all hover:border-primary/20">
        <div
          className={cn(
            "mb-3 flex h-14 w-14 items-center justify-center rounded-full transition-transform group-hover:scale-110",
            color,
          )}
        >
          {icon}
        </div>
        <h3 className="text-center text-sm font-medium">{name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{count} 件</p>
      </div>
    </Link>
  );
}
