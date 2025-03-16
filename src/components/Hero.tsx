"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { ChevronRightIcon, TrendingUpIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const heroImages = [
  "/image/home1.avif",
  "/image/home2.avif",
  "/image/home3.avif",
];

export function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const slideVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="relative h-[85vh] min-h-[600px] overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
      {/* Background image carousel */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 z-10 bg-black/50" />
            <div className="relative h-full w-full">
              <Image
                src={image}
                alt={`Campus marketplace ${index + 1}`}
                fill
                priority={index === 0}
                sizes="100vw"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto flex h-full flex-col justify-center px-4">
        <div className="max-w-2xl">
          <motion.div
            key={currentImageIndex}
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary-foreground backdrop-blur-sm">
              <TrendingUpIcon className="h-3.5 w-3.5" />
              <span>受 10,000+ 名学生的信赖</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              你的校园超市 <br />
              <span className="text-primary">任何商品</span>
            </h1>

            <p className="mb-8 max-w-xl text-lg text-gray-200 md:text-xl">
              在你的校园买到你想要的一切商品，包括教科书、电子产品、家具等。
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="rounded-full bg-primary px-6 hover:bg-primary/90"
                asChild
              >
                <Link href="/categories">
                  探索
                  <ChevronRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/30 bg-white/10 px-6 text-white backdrop-blur-sm hover:bg-white/20"
                asChild
              >
                <Link href="/sell">卖出商品</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Carousel indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center">
        <div className="flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentImageIndex
                  ? "w-8 bg-white"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
