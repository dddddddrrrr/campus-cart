"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { SearchIcon, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useDebounce } from "~/hooks/use-debounce";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 使用防抖处理搜索查询
  const debouncedQuery = useDebounce(query, 300);

  // 当输入为空时，不执行查询
  const { data: searchResults, isLoading } =
    api.product.searchProducts.useQuery(
      { query: debouncedQuery, limit: 10 },
      {
        enabled: debouncedQuery.length > 0,
        staleTime: 1000 * 60,
      },
    );

  // 处理搜索框聚焦
  const handleFocus = () => {
    if (query.length > 1) {
      setIsOpen(true);
    }
  };

  // 处理点击事件，当点击外部时关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 监听查询变化
  useEffect(() => {
    if (debouncedQuery.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  // 处理搜索提交，跳转到最相关的结果页面
  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (query.trim() && searchResults) {
      // 检查是否有完全匹配查询的产品名称
      const exactMatch = searchResults.find(
        (product) =>
          product.name.toLowerCase() === query.toLowerCase() ||
          product.name.toLowerCase().includes(query.toLowerCase()),
      );

      if (exactMatch) {
        // 如果有精确匹配，跳转到该产品详情页
        router.push(`/product/${exactMatch.id}`);
      } else if (searchResults.length > 0) {
        // 否则跳转到第一个结果的详情页
        router.push(`/product/${searchResults[0]?.id}`);
      } else {
        // 如果没有任何结果，可以考虑跳转到搜索结果页面
        // 这里可以根据需要实现
      }

      setIsOpen(false);
      setQuery("");
    }
  };

  // 格式化价格，添加折扣信息
  const formatPrice = (price: number, discount: number) => {
    if (discount && discount > 0) {
      const discountedPrice = price * (1 - discount / 100);
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-primary">
            ¥{discountedPrice.toFixed(2)}
          </span>
          <span className="text-xs line-through">¥{price.toFixed(2)}</span>
        </div>
      );
    }
    return <span className="text-sm font-medium">¥{price.toFixed(2)}</span>;
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="relative">
        <Input
          ref={inputRef}
          type="search"
          placeholder="搜索商品..."
          className="w-[180px] rounded-full border-none bg-secondary/50 py-2 pl-9 pr-4 focus:bg-white lg:w-[280px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 transform">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      </form>

      {/* 搜索结果下拉框 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-[70vh] overflow-y-auto rounded-md border bg-white p-2 shadow-lg",
            "lg:w-[350px]",
          )}
        >
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 rounded-md p-2 hover:bg-secondary/40"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-secondary/30">
                    {product.imageUrl && (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <h4 className="truncate text-sm font-medium">
                      {product.name}
                    </h4>
                    <p className="truncate text-xs text-muted-foreground">
                      {product.categoryName}
                    </p>
                  </div>
                  <div>{formatPrice(product.price, product.discount || 0)}</div>
                </Link>
              ))}
            </div>
          ) : debouncedQuery.length > 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              没有找到相关商品
            </p>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              请输入搜索关键词
            </p>
          )}
        </div>
      )}
    </div>
  );
}
