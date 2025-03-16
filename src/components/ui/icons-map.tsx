import {
  BookOpenIcon,
  LaptopIcon,
  ShirtIcon,
  DumbbellIcon,
  HomeIcon,
  GraduationCapIcon,
  MusicIcon,
  ShoppingBagIcon,
  TagIcon,
} from "lucide-react";

// 图标映射对象
export const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpenIcon className="h-6 w-6 text-blue-600" />,
  Laptop: <LaptopIcon className="h-6 w-6 text-purple-600" />,
  Shirt: <ShirtIcon className="h-6 w-6 text-red-600" />,
  Dumbbell: <DumbbellIcon className="h-6 w-6 text-green-600" />,
  Home: <HomeIcon className="h-6 w-6 text-amber-600" />,
  GraduationCap: <GraduationCapIcon className="h-6 w-6 text-indigo-600" />,
  Music: <MusicIcon className="h-6 w-6 text-pink-600" />,
  ShoppingBag: <ShoppingBagIcon className="h-6 w-6 text-teal-600" />,
  Default: <TagIcon className="h-6 w-6 text-gray-600" />,
};

// 颜色映射对象
export const colorMap: Record<string, string> = {
  BookOpen: "bg-blue-50",
  Laptop: "bg-purple-50",
  Shirt: "bg-red-50",
  Dumbbell: "bg-green-50",
  Home: "bg-amber-50",
  GraduationCap: "bg-indigo-50",
  Music: "bg-pink-50",
  ShoppingBag: "bg-teal-50",
  Default: "bg-gray-50",
};

// 获取图标函数
export function getIconByName(
  iconName: string | null | undefined,
): React.ReactNode {
  if (!iconName) return iconMap.Default;
  return iconName in iconMap ? iconMap[iconName] : iconMap.Default;
}

// 获取颜色函数
export function getColorByIconName(
  iconName: string | null | undefined,
): string {
  // Ensure we always return a string by using non-null assertion
  // This is safe because we know colorMap.Default exists
  if (!iconName) return colorMap.Default!;
  return iconName in colorMap ? colorMap[iconName]! : colorMap.Default!;
}
