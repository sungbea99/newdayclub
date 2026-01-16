import { 
  Ticket, 
  Mountain, 
  Dumbbell, 
  Coffee, 
  GraduationCap, 
  Heart, 
  Palette,
  LucideIcon
} from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  "공연/전시": Ticket,
  "아웃도어": Mountain,
  "스포츠": Dumbbell,
  "문화생활": Coffee,
  "교육/자기계발": GraduationCap,
  "봉사활동": Heart,
  "기타취미": Palette,
};

const categoryColors: Record<string, string> = {
  "공연/전시": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  "아웃도어": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "스포츠": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "문화생활": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "교육/자기계발": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "봉사활동": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "기타취미": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
};

interface CategoryIconProps {
  category: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function CategoryIcon({ category, size = "md", showLabel = false }: CategoryIconProps) {
  const Icon = categoryIcons[category] || Palette;
  const colorClass = categoryColors[category] || "bg-muted text-muted-foreground";
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };
  
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center`}>
        <Icon className={iconSizes[size]} />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-foreground">{category}</span>
      )}
    </div>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const Icon = categoryIcons[category] || Palette;
  const colorClass = categoryColors[category] || "bg-muted text-muted-foreground";
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${colorClass}`}>
      <Icon className="w-4 h-4" />
      {category}
    </span>
  );
}
