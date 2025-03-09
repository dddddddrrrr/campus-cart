'use client'

import {
  BookOpenIcon,
  LaptopIcon,
  ShirtIcon,
  DumbbellIcon,
  HomeIcon,
  GraduationCapIcon,
  MusicIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { CategoryCard } from "~/components/CategoryCard";

const categories = [
  {
    id: "1",
    name: "Textbooks",
    icon: <BookOpenIcon className="h-6 w-6 text-blue-600" />,
    count: 328,
    color: "bg-blue-50",
  },
  {
    id: "2",
    name: "Electronics",
    icon: <LaptopIcon className="h-6 w-6 text-purple-600" />,
    count: 245,
    color: "bg-purple-50",
  },
  {
    id: "3",
    name: "Clothing",
    icon: <ShirtIcon className="h-6 w-6 text-red-600" />,
    count: 193,
    color: "bg-red-50",
  },
  {
    id: "4",
    name: "Sports",
    icon: <DumbbellIcon className="h-6 w-6 text-green-600" />,
    count: 156,
    color: "bg-green-50",
  },
  {
    id: "5",
    name: "Furniture",
    icon: <HomeIcon className="h-6 w-6 text-amber-600" />,
    count: 142,
    color: "bg-amber-50",
  },
  {
    id: "6",
    name: "Course Materials",
    icon: <GraduationCapIcon className="h-6 w-6 text-indigo-600" />,
    count: 118,
    color: "bg-indigo-50",
  },
  {
    id: "7",
    name: "Music & Instruments",
    icon: <MusicIcon className="h-6 w-6 text-pink-600" />,
    count: 87,
    color: "bg-pink-50",
  },
  {
    id: "8",
    name: "Accessories",
    icon: <ShoppingBagIcon className="h-6 w-6 text-teal-600" />,
    count: 215,
    color: "bg-teal-50",
  },
];

export function CategoriesSection() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 px-4 py-16">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-2xl font-bold">Shop by Category</h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Browse through our wide selection of categories to find exactly what
            you need
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-8">
          {categories.map((category, index) => {
            // 使用预定义的延迟类名
            const delayClasses = [
              'delay-0',
              'delay-100',
              'delay-200',
              'delay-300',
              'delay-400'
            ];
            const delayClass = delayClasses[index % 5];
            
            return (
              <div
                key={category.id}
                className={`animate-fade-in opacity-0 ${delayClass}`}
              >
                <CategoryCard {...category} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
