"use client";

import Link from "next/link";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col items-center rounded-xl border bg-white p-4 hover:border-primary/20"
      >
        <div
          className={cn(
            "mb-3 flex h-14 w-14 items-center justify-center rounded-full group-hover:scale-110",
            color,
          )}
        >
          {icon}
        </div>
        <h3 className="text-center text-sm font-medium">{name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{count} 件</p>
      </motion.div>
    </Link>
  );
}
