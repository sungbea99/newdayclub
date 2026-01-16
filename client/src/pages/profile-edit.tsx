import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  INTEREST_CATEGORIES, 
  ACTIVITY_FREQUENCY, 
  PREFERRED_TIME, 
  GROUP_SIZE, 
  GENDER_PREFERENCE,
  ACTIVITY_STYLES 
} from "@shared/schema";
import type { Profile } from "@shared/schema";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, User } from "lucide-react";

const profileFormSchema = z.object({
  nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다").max(50),
  birthYear: z.coerce.number().min(1940).max(1990).optional(),
  gender: z.string().optional(),
  region: z.string().optional(),
  bio: z.string().max(500).optional(),
  interests: z.array(z.string()).min(1, "최소 1개의 관심사를 선택해주세요"),
  activityFrequency: z.string().optional(),
  preferredTime: z.array(z.string()).optional(),
  preferredGroupSize: z.string().optional(),
  genderPreference: z.string().optional(),
  activityStyles: z.array(z.string()).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileEdit() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: existingProfile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/profiles/me"],
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nickname: existingProfile?.nickname || user?.firstName || "",
      birthYear: existingProfile?.birthYear || undefined,
      gender: existingProfile?.gender || "",
      region: existingProfile?.region || "",
      bio: existingProfile?.bio || "",
      interests: existingProfile?.interests || [],
      activityFrequency: existingProfile?.activityFrequency || "",
      preferredTime: existingProfile?.preferredTime || [],
      preferredGroupSize: existingProfile?.preferredGroupSize || "",
      genderPreference: existingProfile?.genderPreference || "",
      activityStyles: existingProfile?.activityStyles || [],
    },
    values: existingProfile ? {
      nickname: existingProfile.nickname || "",
      birthYear: existingProfile.birthYear || undefined,
      gender: existingProfile.gender || "",
      region: existingProfile.region || "",
      bio: existingProfile.bio || "",
      interests: existingProfile.interests || [],
      activityFrequency: existingProfile.activityFrequency || "",
      preferredTime: existingProfile.preferredTime || [],
      preferredGroupSize: existingProfile.preferredGroupSize || "",
      genderPreference: existingProfile.genderPreference || "",
      activityStyles: existingProfile.activityStyles || [],
    } : undefined,
  });

  const saveMutation = useMutation({
    mutationFn: (data: ProfileFormValues) => {
      return apiRequest(existingProfile ? "PATCH" : "POST", "/api/profiles", data);
    },
    onSuccess: () => {
      toast({
        title: "프로필 저장 완료",
        description: "프로필이 성공적으로 저장되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
      navigate("/profile");
    },
    onError: () => {
      toast({
        title: "저장 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    saveMutation.mutate(data);
  };

  const currentYear = new Date().getFullYear();
  const birthYears = Array.from({ length: 51 }, (_, i) => currentYear - 50 - i);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate("/profile")}
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        뒤로가기
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">프로필 편집</h1>
        <p className="text-muted-foreground">취향 정보를 입력하면 맞춤 동행자를 추천받을 수 있어요</p>
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
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>닉네임 *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="닉네임을 입력해주세요" 
                        {...field} 
                        data-testid="input-nickname"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="birthYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>출생연도</FormLabel>
                      <Select 
                        onValueChange={(v) => field.onChange(parseInt(v))} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-birthyear">
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {birthYears.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}년
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
                  name="gender"
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
                          <SelectItem value="남성">남성</SelectItem>
                          <SelectItem value="여성">여성</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>거주지역</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="예: 서울 강남구" 
                        {...field} 
                        data-testid="input-region"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>자기소개</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="간단한 자기소개를 작성해주세요 (최대 500자)"
                        className="min-h-[100px]"
                        {...field} 
                        data-testid="input-bio"
                      />
                    </FormControl>
                    <FormDescription>{field.value?.length || 0}/500</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">관심 분야 *</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="interests"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-2 gap-3">
                      {INTEREST_CATEGORIES.map((category) => (
                        <FormField
                          key={category}
                          control={form.control}
                          name="interests"
                          render={({ field }) => (
                            <FormItem
                              key={category}
                              className="flex flex-row items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(category)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, category])
                                      : field.onChange(
                                          field.value?.filter((v) => v !== category)
                                        );
                                  }}
                                  data-testid={`checkbox-interest-${category}`}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {category}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">활동 선호도</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="activityFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>선호 활동 빈도</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-frequency">
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTIVITY_FREQUENCY.map((freq) => (
                          <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredTime"
                render={() => (
                  <FormItem>
                    <FormLabel>선호 시간대</FormLabel>
                    <div className="flex flex-wrap gap-3">
                      {PREFERRED_TIME.map((time) => (
                        <FormField
                          key={time}
                          control={form.control}
                          name="preferredTime"
                          render={({ field }) => (
                            <FormItem
                              key={time}
                              className="flex flex-row items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(time)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), time])
                                      : field.onChange(
                                          field.value?.filter((v) => v !== time)
                                        );
                                  }}
                                  data-testid={`checkbox-time-${time}`}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {time}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preferredGroupSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>선호 모임 규모</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-groupsize">
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GROUP_SIZE.map((size) => (
                            <SelectItem key={size} value={size}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genderPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>선호 성별 구성</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-genderpref">
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GENDER_PREFERENCE.map((pref) => (
                            <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">활동 스타일</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="activityStyles"
                render={() => (
                  <FormItem>
                    <div className="flex flex-wrap gap-3">
                      {ACTIVITY_STYLES.map((style) => (
                        <FormField
                          key={style}
                          control={form.control}
                          name="activityStyles"
                          render={({ field }) => (
                            <FormItem
                              key={style}
                              className="flex flex-row items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(style)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), style])
                                      : field.onChange(
                                          field.value?.filter((v) => v !== style)
                                        );
                                  }}
                                  data-testid={`checkbox-style-${style}`}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                #{style}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
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
              onClick={() => navigate("/profile")}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={saveMutation.isPending}
              data-testid="button-save"
            >
              {saveMutation.isPending ? "저장 중..." : "저장하기"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
