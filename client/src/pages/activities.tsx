import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryIcon, CategoryBadge } from "@/components/category-icon";
import { getCategoryImage } from "@/components/category-images";
import { VerificationBadges } from "@/components/verification-badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Activity, Profile } from "@shared/schema";
import { INTEREST_CATEGORIES } from "@shared/schema";
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Search,
  Filter,
  Plus,
  SlidersHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function ActivityCard({ activity }: { activity: Activity }) {
  const statusColors: Record<string, string> = {
    "모집중": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    "마감임박": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    "마감": "bg-muted text-muted-foreground",
  };

  return (
    <Link href={`/activities/${activity.id}`}>
      <Card className="hover-elevate cursor-pointer h-full" data-testid={`activity-card-${activity.id}`}>
        <CardContent className="p-0">
          <div className="aspect-[4/3] bg-muted relative overflow-hidden rounded-t-lg">
            <img 
              src={activity.images?.[0] || getCategoryImage(activity.category)} 
              alt={activity.title} 
              className="w-full h-full object-cover"
            />
            <Badge 
              className={`absolute top-3 left-3 ${statusColors[activity.status || "모집중"]}`}
            >
              {activity.status}
            </Badge>
          </div>
          
          <div className="p-4 space-y-3">
            <CategoryBadge category={activity.category} />
            
            <h3 className="font-bold text-lg line-clamp-2">{activity.title}</h3>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 shrink-0" />
                <span>
                  {activity.activityDate 
                    ? format(new Date(activity.activityDate), "M월 d일 (EEEE) HH:mm", { locale: ko })
                    : "날짜 미정"
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{activity.location || "장소 미정"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 shrink-0" />
                <span>{activity.currentParticipants}/{activity.maxParticipants}명</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ActivityCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Skeleton className="aspect-[4/3] rounded-t-lg" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSheet({ 
  selectedCategory, 
  onCategoryChange 
}: { 
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" data-testid="button-filter">
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>필터</SheetTitle>
        </SheetHeader>
        <div className="py-6 space-y-6">
          <div>
            <h4 className="font-medium mb-4">카테고리</h4>
            <div className="space-y-2">
              <Button
                variant={selectedCategory === null ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onCategoryChange(null)}
                data-testid="filter-category-all"
              >
                전체
              </Button>
              {INTEREST_CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => onCategoryChange(category)}
                  data-testid={`filter-category-${category}`}
                >
                  <CategoryIcon category={category} size="sm" />
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Activities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const filteredActivities = activities?.filter((activity) => {
    const matchesSearch = !searchQuery || 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || activity.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">동행 탐색</h1>
          <p className="text-muted-foreground">함께할 동행자를 찾아보세요</p>
        </div>
        
        <Button asChild data-testid="button-create-activity">
          <Link href="/activities/new">
            <Plus className="w-4 h-4 mr-2" />
            동행 모집하기
          </Link>
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="동행 검색..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-activities"
          />
        </div>
        <FilterSheet 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === null ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="whitespace-nowrap"
            data-testid="category-pill-all"
          >
            전체
          </Button>
          {INTEREST_CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
              data-testid={`category-pill-${category}`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
          </>
        ) : filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-muted/30 rounded-xl">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery || selectedCategory ? "검색 결과가 없습니다" : "등록된 동행이 없습니다"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory 
                ? "다른 검색어나 카테고리를 시도해보세요"
                : "첫 번째 동행 모집을 시작해보세요!"
              }
            </p>
            {!searchQuery && !selectedCategory && (
              <Button asChild data-testid="button-create-first-activity">
                <Link href="/activities/new">동행 모집하기</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
