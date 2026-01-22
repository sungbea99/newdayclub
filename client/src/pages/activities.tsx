import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryIcon, CategoryBadge } from "@/components/category-icon";
import { getCategoryImage } from "@/components/category-images";
import { VerificationBadges } from "@/components/verification-badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Activity, Profile } from "@shared/schema";
import { INTEREST_CATEGORIES, REGIONS, DISTRICTS } from "@shared/schema";
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Search,
  Filter,
  Plus,
  SlidersHorizontal,
  ImagePlus,
  ArrowUpDown,
  X,
  Coins
} from "lucide-react";
import { format, isToday, isThisWeek, isThisMonth, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, isBefore, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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

const DATE_FILTERS = [
  { value: "all", label: "전체" },
  { value: "today", label: "오늘" },
  { value: "this_week", label: "이번 주" },
  { value: "this_month", label: "이번 달" },
] as const;

const PARTICIPANTS_FILTERS = [
  { value: "all", label: "전체" },
  { value: "2-3", label: "2-3명" },
  { value: "4-5", label: "4-5명" },
  { value: "6+", label: "6명 이상" },
] as const;

const COST_FILTERS = [
  { value: "all", label: "전체" },
  { value: "free", label: "무료" },
  { value: "10000", label: "~1만원" },
  { value: "30000", label: "~3만원" },
  { value: "50000", label: "~5만원" },
  { value: "50000+", label: "5만원 이상" },
] as const;

const SORT_OPTIONS = [
  { value: "recommended", label: "추천순" },
  { value: "latest", label: "최신순" },
  { value: "deadline", label: "마감임박순" },
  { value: "popular", label: "인기순" },
] as const;

type FilterState = {
  category: string | null;
  region: string | null;
  dateFilter: string;
  participants: string;
  cost: string;
  sortBy: string;
};

function FilterSheet({ 
  filters,
  onFilterChange
}: { 
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | null) => void;
}) {
  const currentCity = filters.region?.split(" ")[0] || null;
  const currentDistrict = filters.region?.split(" ")[1] || null;
  const availableDistricts = currentCity ? DISTRICTS[currentCity] || [] : [];

  const handleCityChange = (city: string | null) => {
    onFilterChange("region", city);
  };

  const handleDistrictChange = (district: string) => {
    onFilterChange("region", `${currentCity} ${district}`);
  };

  const activeFilterCount = [
    filters.category,
    filters.region,
    filters.dateFilter !== "all" ? filters.dateFilter : null,
    filters.participants !== "all" ? filters.participants : null,
    filters.cost !== "all" ? filters.cost : null,
  ].filter(Boolean).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative" data-testid="button-filter">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>필터 및 정렬</SheetTitle>
        </SheetHeader>
        <div className="py-6 space-y-6">
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              정렬
            </h4>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.sortBy === option.value ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange("sortBy", option.value)}
                  data-testid={`sort-${option.value}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              날짜
            </h4>
            <div className="flex flex-wrap gap-2">
              {DATE_FILTERS.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.dateFilter === option.value ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange("dateFilter", option.value)}
                  data-testid={`filter-date-${option.value}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              시/도
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.region === null ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleCityChange(null)}
                data-testid="filter-region-all"
              >
                전체
              </Button>
              {REGIONS.map((region) => (
                <Button
                  key={region}
                  variant={currentCity === region ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleCityChange(region)}
                  data-testid={`filter-region-${region}`}
                >
                  {region}
                </Button>
              ))}
            </div>
          </div>
          {currentCity && availableDistricts.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">구/군</h4>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                <Button
                  variant={!currentDistrict ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange("region", currentCity)}
                  data-testid="filter-district-all"
                >
                  전체
                </Button>
                {availableDistricts.map((district) => (
                  <Button
                    key={district}
                    variant={currentDistrict === district ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handleDistrictChange(district)}
                    data-testid={`filter-district-${district}`}
                  >
                    {district}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              인원수
            </h4>
            <div className="flex flex-wrap gap-2">
              {PARTICIPANTS_FILTERS.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.participants === option.value ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange("participants", option.value)}
                  data-testid={`filter-participants-${option.value}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              예상 비용
            </h4>
            <div className="flex flex-wrap gap-2">
              {COST_FILTERS.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.cost === option.value ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange("cost", option.value)}
                  data-testid={`filter-cost-${option.value}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">카테고리</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.category === null ? "secondary" : "outline"}
                size="sm"
                onClick={() => onFilterChange("category", null)}
                data-testid="filter-category-all"
              >
                전체
              </Button>
              {INTEREST_CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={filters.category === category ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange("category", category)}
                  data-testid={`filter-category-${category}`}
                >
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

const activityFormSchema = z.object({
  title: z.string().min(5, "제목은 5자 이상이어야 합니다").max(200),
  category: z.string().min(1, "카테고리를 선택해주세요"),
  description: z.string().min(10, "설명은 10자 이상이어야 합니다"),
  activityDate: z.string().min(1, "날짜를 선택해주세요"),
  location: z.string().min(2, "장소를 입력해주세요"),
  estimatedCost: z.string().optional(),
  maxParticipants: z.coerce.number().min(2).max(20),
  ageRange: z.string().optional(),
  genderRestriction: z.string().optional(),
  activityLevel: z.string().optional(),
  tags: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isFriendsOnly: z.boolean().default(false),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

function CreateActivityForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      activityDate: "",
      location: "",
      estimatedCost: "",
      maxParticipants: 5,
      ageRange: "무관",
      genderRestriction: "무관",
      activityLevel: "무관",
      tags: "",
      imageUrl: "",
      isFriendsOnly: false,
    },
  });

  const selectedCategory = form.watch("category");
  const imageUrl = form.watch("imageUrl");

  const createMutation = useMutation({
    mutationFn: (data: ActivityFormValues) => {
      const payload = {
        ...data,
        activityDate: new Date(data.activityDate).toISOString(),
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
        images: data.imageUrl ? [data.imageUrl] : [],
      };
      return apiRequest("POST", "/api/activities", payload);
    },
    onSuccess: () => {
      toast({
        title: "동행 모집 등록 완료",
        description: "동행 모집이 성공적으로 등록되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      form.reset();
      onSuccess();
    },
    onError: () => {
      toast({
        title: "등록 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ActivityFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목 *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="예: 이번 주말 북한산 등산 함께 하실 분" 
                      {...field} 
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리 *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INTEREST_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상세 설명 *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="활동에 대한 자세한 설명을 작성해주세요..."
                      className="min-h-[120px]"
                      {...field} 
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImagePlus className="w-5 h-5" />
              대표 이미지
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden bg-muted">
              <img 
                src={imageUrl || (selectedCategory ? getCategoryImage(selectedCategory) : getCategoryImage("소모임"))} 
                alt="대표 이미지 미리보기"
                className="w-full h-full object-cover"
              />
            </div>
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이미지 URL (선택)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      {...field} 
                      data-testid="input-image-url"
                    />
                  </FormControl>
                  <FormDescription>
                    이미지를 등록하지 않으면 카테고리에 맞는 기본 이미지가 표시됩니다
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">일정 및 장소</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="activityDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>날짜 및 시간 *</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      data-testid="input-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>만남 장소 *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="예: 북한산 국립공원 입구" 
                      {...field} 
                      data-testid="input-location"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>예상 비용</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="예: 무료, 1만원" 
                        {...field} 
                        data-testid="input-cost"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>모집 인원</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={2}
                        max={20}
                        {...field} 
                        data-testid="input-participants"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">참여 조건</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ageRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>연령대</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-age">
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="무관">무관</SelectItem>
                        <SelectItem value="40대">40대</SelectItem>
                        <SelectItem value="50대">50대</SelectItem>
                        <SelectItem value="60대">60대</SelectItem>
                        <SelectItem value="50-60대">50-60대</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genderRestriction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>성별</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-gender">
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="무관">무관</SelectItem>
                        <SelectItem value="남성만">남성만</SelectItem>
                        <SelectItem value="여성만">여성만</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>활동 레벨</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-level">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="무관">무관</SelectItem>
                      <SelectItem value="초보자">초보자</SelectItem>
                      <SelectItem value="중급자">중급자</SelectItem>
                      <SelectItem value="상급자">상급자</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">추가 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>해시태그</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="예: 등산, 주말, 초보환영 (쉼표로 구분)" 
                      {...field} 
                      data-testid="input-tags"
                    />
                  </FormControl>
                  <FormDescription>쉼표로 구분하여 입력해주세요</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFriendsOnly"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">친구에게만 공개</FormLabel>
                    <FormDescription>
                      친구로 등록된 사람에게만 이 모집글이 보입니다
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-friends-only"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full"
          size="lg"
          disabled={createMutation.isPending}
          data-testid="button-submit"
        >
          {createMutation.isPending ? "등록 중..." : "동행 모집 등록하기"}
        </Button>
      </form>
    </Form>
  );
}

export default function Activities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    region: null,
    dateFilter: "all",
    participants: "all",
    cost: "all",
    sortBy: "recommended",
  });
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const tabParam = urlParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam === "create" ? "create" : "search");
  
  useEffect(() => {
    if (tabParam === "create") {
      setActiveTab("create");
    }
  }, [tabParam]);
  
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const handleFilterChange = (key: keyof FilterState, value: string | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const parseCost = (costString: string | undefined | null): number => {
    if (!costString) return 0;
    const numMatch = costString.replace(/[^0-9]/g, "");
    return numMatch ? parseInt(numMatch, 10) : 0;
  };

  const filteredAndSortedActivities = (() => {
    let result = activities?.filter((activity) => {
      const matchesSearch = !searchQuery || 
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !filters.category || activity.category === filters.category;
      
      const matchesRegion = !filters.region || 
        activity.location?.includes(filters.region);
      
      let matchesDate = true;
      if (filters.dateFilter !== "all" && activity.activityDate) {
        const activityDate = new Date(activity.activityDate);
        const now = new Date();
        switch (filters.dateFilter) {
          case "today":
            matchesDate = isToday(activityDate);
            break;
          case "this_week":
            matchesDate = isThisWeek(activityDate, { weekStartsOn: 1 });
            break;
          case "this_month":
            matchesDate = isThisMonth(activityDate);
            break;
        }
      }

      let matchesParticipants = true;
      if (filters.participants !== "all") {
        const max = activity.maxParticipants || 5;
        switch (filters.participants) {
          case "2-3":
            matchesParticipants = max >= 2 && max <= 3;
            break;
          case "4-5":
            matchesParticipants = max >= 4 && max <= 5;
            break;
          case "6+":
            matchesParticipants = max >= 6;
            break;
        }
      }

      let matchesCost = true;
      if (filters.cost !== "all") {
        const cost = parseCost(activity.estimatedCost);
        switch (filters.cost) {
          case "free":
            matchesCost = activity.estimatedCost?.includes("무료") || activity.estimatedCost === "0원" || activity.estimatedCost === "0" || (cost === 0 && !!activity.estimatedCost);
            break;
          case "10000":
            matchesCost = cost > 0 && cost <= 10000;
            break;
          case "30000":
            matchesCost = cost > 10000 && cost <= 30000;
            break;
          case "50000":
            matchesCost = cost > 30000 && cost <= 50000;
            break;
          case "50000+":
            matchesCost = cost > 50000;
            break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesRegion && matchesDate && matchesParticipants && matchesCost;
    }) || [];

    switch (filters.sortBy) {
      case "latest":
        result = result.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
      case "deadline":
        result = result.sort((a, b) => {
          const dateA = a.activityDate ? new Date(a.activityDate).getTime() : Infinity;
          const dateB = b.activityDate ? new Date(b.activityDate).getTime() : Infinity;
          return dateA - dateB;
        });
        break;
      case "popular":
        result = result.sort((a, b) => 
          (b.currentParticipants || 0) - (a.currentParticipants || 0)
        );
        break;
      case "recommended":
      default:
        break;
    }

    return result;
  })();

  const handleCreateSuccess = () => {
    setActiveTab("search");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">동행 찾기</h1>
        <p className="text-muted-foreground">함께할 동행자를 찾거나 모집해보세요</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="search" className="text-base" data-testid="tab-search">
            <Search className="w-4 h-4 mr-2" />
            동행 탐색
          </TabsTrigger>
          <TabsTrigger value="create" className="text-base" data-testid="tab-create">
            <Plus className="w-4 h-4 mr-2" />
            동행 모집
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-0">
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
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {(filters.region || filters.category || filters.dateFilter !== "all" || filters.participants !== "all" || filters.cost !== "all") && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {filters.region && (
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="w-3 h-3" />
                  {filters.region}
                  <button 
                    onClick={() => handleFilterChange("region", null)}
                    className="ml-1 hover:text-destructive"
                    data-testid="button-clear-region"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  {filters.category}
                  <button 
                    onClick={() => handleFilterChange("category", null)}
                    className="ml-1 hover:text-destructive"
                    data-testid="button-clear-category"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.dateFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {DATE_FILTERS.find(d => d.value === filters.dateFilter)?.label}
                  <button 
                    onClick={() => handleFilterChange("dateFilter", "all")}
                    className="ml-1 hover:text-destructive"
                    data-testid="button-clear-date"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.participants !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  <Users className="w-3 h-3" />
                  {PARTICIPANTS_FILTERS.find(p => p.value === filters.participants)?.label}
                  <button 
                    onClick={() => handleFilterChange("participants", "all")}
                    className="ml-1 hover:text-destructive"
                    data-testid="button-clear-participants"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.cost !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  <Coins className="w-3 h-3" />
                  {COST_FILTERS.find(c => c.value === filters.cost)?.label}
                  <button 
                    onClick={() => handleFilterChange("cost", "all")}
                    className="ml-1 hover:text-destructive"
                    data-testid="button-clear-cost"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

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
            ) : filteredAndSortedActivities.length > 0 ? (
              filteredAndSortedActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-muted/30 rounded-xl">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery || filters.category ? "검색 결과가 없습니다" : "등록된 동행이 없습니다"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filters.category 
                    ? "다른 검색어나 필터 조건을 시도해보세요"
                    : "첫 번째 동행 모집을 시작해보세요!"
                  }
                </p>
                {!searchQuery && !filters.category && (
                  <Button onClick={() => setActiveTab("create")} data-testid="button-create-first-activity">
                    동행 모집하기
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="mt-0">
          <div className="max-w-2xl mx-auto">
            <CreateActivityForm onSuccess={handleCreateSuccess} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
