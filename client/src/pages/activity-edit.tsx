import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { INTEREST_CATEGORIES, type Activity } from "@shared/schema";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { getCategoryImage } from "@/components/category-images";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

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
  status: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

export default function ActivityEdit() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: activity, isLoading } = useQuery<Activity>({
    queryKey: ["/api/activities", id],
    enabled: !!id,
  });

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    values: activity ? {
      title: activity.title,
      category: activity.category,
      description: activity.description || "",
      activityDate: activity.activityDate 
        ? format(new Date(activity.activityDate), "yyyy-MM-dd'T'HH:mm")
        : "",
      location: activity.location || "",
      estimatedCost: activity.estimatedCost || "",
      maxParticipants: activity.maxParticipants || 5,
      ageRange: activity.ageRange || "무관",
      genderRestriction: activity.genderRestriction || "무관",
      activityLevel: activity.activityLevel || "무관",
      tags: activity.tags?.join(", ") || "",
      imageUrl: activity.images?.[0] || "",
      isFriendsOnly: activity.isFriendsOnly || false,
      status: activity.status || "모집중",
    } : undefined,
  });

  const selectedCategory = form.watch("category");
  const imageUrl = form.watch("imageUrl");

  const updateMutation = useMutation({
    mutationFn: (data: ActivityFormValues) => {
      const payload = {
        ...data,
        activityDate: new Date(data.activityDate).toISOString(),
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
        images: data.imageUrl ? [data.imageUrl] : [],
      };
      return apiRequest("PATCH", `/api/activities/${id}`, payload);
    },
    onSuccess: () => {
      toast({
        title: "수정 완료",
        description: "동행 모집글이 수정되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      navigate(`/activities/${id}`);
    },
    onError: () => {
      toast({
        title: "수정 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ActivityFormValues) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
        <Skeleton className="h-10 w-32 mb-6" />
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8 text-center">
        <h1 className="text-2xl font-bold mb-4">동행을 찾을 수 없습니다</h1>
        <Button asChild>
          <a href="/activities">목록으로 돌아가기</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(`/activities/${id}`)}
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        뒤로가기
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">동행 모집 수정</h1>
        <p className="text-muted-foreground">모집글 정보를 수정하세요</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">모집 상태</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>상태</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="상태 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="모집중">모집중</SelectItem>
                        <SelectItem value="마감임박">마감임박</SelectItem>
                        <SelectItem value="마감">마감</SelectItem>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate(`/activities/${id}`)}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={updateMutation.isPending}
              data-testid="button-submit"
            >
              {updateMutation.isPending ? "수정 중..." : "수정 완료"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
