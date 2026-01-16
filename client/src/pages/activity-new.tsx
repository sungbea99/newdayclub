import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { INTEREST_CATEGORIES } from "@shared/schema";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, CalendarDays, MapPin, Users, DollarSign } from "lucide-react";

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
  isFriendsOnly: z.boolean().default(false),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

export default function ActivityNew() {
  const [, navigate] = useLocation();
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
      isFriendsOnly: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ActivityFormValues) => {
      const payload = {
        ...data,
        activityDate: new Date(data.activityDate).toISOString(),
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
      };
      return apiRequest("POST", "/api/activities", payload);
    },
    onSuccess: () => {
      toast({
        title: "동행 모집 등록 완료",
        description: "동행 모집이 성공적으로 등록되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      navigate("/activities");
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
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate("/activities")}
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        뒤로가기
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">동행 모집하기</h1>
        <p className="text-muted-foreground">함께할 동행자를 모집해보세요</p>
      </div>

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

          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate("/activities")}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={createMutation.isPending}
              data-testid="button-submit"
            >
              {createMutation.isPending ? "등록 중..." : "동행 모집 등록"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
