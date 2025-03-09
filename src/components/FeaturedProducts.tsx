"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ProductCard } from "~/components/ProductCard";

const PRODUCTS_PER_PAGE = 4;

const featuredProducts = [
  {
    id: "1",
    name: "MacBook Pro 15-inch (2019)",
    price: 1299,
    imageUrl:
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop",
    category: "Electronics",
    isNew: true,
    isFeatured: true,
    discount: 10,
    sellerName: "Apple Store",
    rating: 5,
  },
  {
    id: "2",
    name: "Wireless Noise Cancelling Headphones",
    price: 199,
    imageUrl:
      "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=2087&auto=format&fit=crop",
    category: "Electronics",
    isNew: false,
    isFeatured: true,
    discount: 0,
    sellerName: "AudioTech",
    rating: 4,
  },
  {
    id: "3",
    name: "Calculus Early Transcendentals Textbook",
    price: 89,
    imageUrl:
      "https://images.unsplash.com/photo-1584473457406-6240486418e9?q=80&w=2070&auto=format&fit=crop",
    category: "Books",
    isNew: false,
    isFeatured: true,
    discount: 15,
    sellerName: "BookStore",
    rating: 4,
  },
  {
    id: "4",
    name: "Modern Desk Lamp",
    price: 49.99,
    imageUrl:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop",
    category: "Home & Living",
    isNew: true,
    isFeatured: true,
    discount: 0,
    sellerName: "HomeDecor",
    rating: 5,
  },
  {
    id: "5",
    name: "Basketball - Official Size",
    price: 29.99,
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1470&auto=format&fit=crop",
    category: "Sports",
    isNew: false,
    isFeatured: true,
    discount: 0,
    sellerName: "SportGoods",
    rating: 4,
  },
  {
    id: "6",
    name: "Ergonomic Office Chair",
    price: 199.99,
    imageUrl:
      "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?q=80&w=2070&auto=format&fit=crop",
    category: "Furniture",
    isNew: false,
    isFeatured: true,
    discount: 20,
    sellerName: "FurnitureWorld",
    rating: 4,
  },
  {
    id: "7",
    name: "Designer Backpack",
    price: 79.99,
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2070&auto=format&fit=crop",
    category: "Fashion",
    isNew: true,
    isFeatured: true,
    discount: 0,
    sellerName: "FashionTrends",
    rating: 5,
  },
  {
    id: "8",
    name: "Water Bottle - 32oz",
    price: 24.99,
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=2070&auto=format&fit=crop",
    category: "Accessories",
    isNew: false,
    isFeatured: true,
    discount: 0,
    sellerName: "EcoGoods",
    rating: 4,
  },
];

export function FeaturedProducts() {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(featuredProducts.length / PRODUCTS_PER_PAGE);

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const visibleProducts = featuredProducts.slice(
    currentPage * PRODUCTS_PER_PAGE,
    (currentPage + 1) * PRODUCTS_PER_PAGE,
  );

  return (
    <section className="px-4 py-16">
      <div className="container mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-bold">Featured Products</h2>
            <p className="text-muted-foreground">
              Discover our handpicked selection of top campus essentials
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={handlePrevPage}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={handleNextPage}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <div key={product.id} className="animate-fade-in opacity-0">
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
