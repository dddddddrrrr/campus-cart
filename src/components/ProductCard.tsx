import { useState } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { HeartIcon, ShoppingCartIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import Image from "next/image";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  isNew?: boolean;
  isFeatured?: boolean;
  discount?: number;
  sellerName: string;
  rating: number;
}

export function ProductCard({
  id,
  name,
  price,
  imageUrl,
  category,
  isNew = false,
  discount = 0,
  sellerName,
  rating,
}: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  console.log(imageUrl, "imageUrl");

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

  const discountedPrice =
    discount > 0
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price * (1 - discount / 100))
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <Link href={`/product/${id}`}>
      <Card
        className={cn(
          "group flex h-full flex-col overflow-hidden border-none transition-all duration-300 hover:shadow-lg",
          isHovered ? "scale-[1.02]" : "scale-100",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
          <Image
            src={imageUrl}
            alt={name}
            className={cn(
              "h-full w-full object-cover transition-all duration-500",
              isHovered ? "scale-110" : "scale-100",
            )}
            width={480}
            height={360}
          />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {isNew && (
              <Badge className="animate-fade-in bg-primary px-2.5 font-medium text-white">
                新品
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="animate-fade-in bg-destructive px-2.5 font-medium text-white delay-100">
                {discount}% 折扣
              </Badge>
            )}
          </div>

          <div
            className={cn(
              "absolute bottom-3 right-3 flex items-center gap-2 transition-all duration-300",
              isHovered
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0",
            )}
          >
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white shadow-sm hover:bg-white/90"
              onClick={handleToggleLike}
            >
              <HeartIcon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isLiked ? "fill-red-500 text-red-500" : "text-gray-600",
                )}
              />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white shadow-sm hover:bg-white/90"
              onClick={handleAddToCart}
            >
              <ShoppingCartIcon className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Product info */}
        <div className="flex flex-grow flex-col p-4">
          <div className="mb-1 text-sm text-muted-foreground">{category}</div>
          <h3 className="mb-2 line-clamp-2 text-base font-medium">{name}</h3>

          <div className="mt-auto">
            <div className="mb-1.5 flex items-center text-sm text-muted-foreground">
              <span>by {sellerName}</span>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg
                    key={i}
                    className={`h-3 w-3 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {discount > 0 ? (
                <>
                  <span className="font-semibold">{discountedPrice}</span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formattedPrice}
                  </span>
                </>
              ) : (
                <span className="font-semibold">{formattedPrice}</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
