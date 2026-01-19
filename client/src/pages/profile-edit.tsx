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
import { ArrowLeft, User, Phone, Camera, CheckCircle, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerificationBadges } from "@/components/verification-badge";
import { useState } from "react";

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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");

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

  const phoneVerifyMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/profiles/verify-phone", { phoneNumber }),
    onSuccess: () => {
      toast({
        title: "전화번호 인증 완료",
        description: "전화번호가 성공적으로 인증되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
      setIsCodeSent(false);
      setPhoneNumber("");
      setVerificationCode("");
    },
    onError: () => {
      toast({
        title: "인증 실패",
        description: "인증 코드가 올바르지 않습니다.",
        variant: "destructive",
      });
    },
  });

  const photoVerifyMutation = useMutation({
    mutationFn: (imageUrl: string) => apiRequest("POST", "/api/profiles/verify-photo", { imageUrl }),
    onSuccess: () => {
      toast({
        title: "프로필 사진 등록 완료",
        description: "프로필 사진이 성공적으로 등록되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
      setProfileImageUrl("");
    },
    onError: () => {
      toast({
        title: "등록 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleSendCode = () => {
    if (phoneNumber.length < 10) {
      toast({
        title: "전화번호 오류",
        description: "올바른 전화번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    setIsCodeSent(true);
    toast({
      title: "인증번호 발송",
      description: "입력하신 번호로 인증번호가 발송되었습니다. (테스트: 1234)",
    });
  };

  const handleVerifyPhone = () => {
    if (verificationCode === "1234") {
      phoneVerifyMutation.mutate();
    } else {
      toast({
        title: "인증 실패",
        description: "인증 코드가 올바르지 않습니다. (테스트: 1234)",
        variant: "destructive",
      });
    }
  };

  const handlePhotoSubmit = () => {
    if (!profileImageUrl) {
      toast({
        title: "이미지 URL 오류",
        description: "프로필 이미지 URL을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    photoVerifyMutation.mutate(profileImageUrl);
  };

  const onSubmit = (data: ProfileFormValues) => {
    saveMutation.mutate(data);
  };

  // 1987년부터 1940년까지 (50-60대 시니어 대상 + 여유 범위)
  const birthYears = Array.from({ length: 48 }, (_, i) => 1987 - i);

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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            인증 관리
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-muted-foreground">현재 인증 상태:</span>
            <VerificationBadges 
              isPhoneVerified={existingProfile?.isPhoneVerified ?? false}
              isPhotoVerified={existingProfile?.isPhotoVerified ?? false}
              activityCount={existingProfile?.activityCount ?? 0}
              averageRating={existingProfile?.averageRating ?? 0}
            />
            {!existingProfile?.isPhoneVerified && !existingProfile?.isPhotoVerified && (
              <span className="text-sm text-muted-foreground">인증된 항목 없음</span>
            )}
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-500" />
              <h4 className="font-medium">전화번호 인증</h4>
              {existingProfile?.isPhoneVerified && (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  인증완료
                </span>
              )}
            </div>
            {existingProfile?.isPhoneVerified ? (
              <p className="text-sm text-muted-foreground">
                전화번호 인증이 완료되었습니다. 신뢰도 높은 회원으로 표시됩니다.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  전화번호를 인증하면 신뢰도가 높아지고 다른 회원들에게 더 많이 노출됩니다.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="010-0000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1"
                    data-testid="input-phone"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleSendCode}
                    disabled={isCodeSent}
                    data-testid="button-send-code"
                  >
                    {isCodeSent ? "발송됨" : "인증번호 받기"}
                  </Button>
                </div>
                {isCodeSent && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="인증번호 입력"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="flex-1"
                      data-testid="input-verification-code"
                    />
                    <Button 
                      type="button"
                      onClick={handleVerifyPhone}
                      disabled={phoneVerifyMutation.isPending}
                      data-testid="button-verify-phone"
                    >
                      {phoneVerifyMutation.isPending ? "확인 중..." : "인증 확인"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-green-500" />
              <h4 className="font-medium">프로필 사진 등록</h4>
              {existingProfile?.isPhotoVerified && (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  등록완료
                </span>
              )}
            </div>
            
            <div className="flex items-start gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={existingProfile?.profileImages?.[0] || profileImageUrl} />
                <AvatarFallback className="text-2xl">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                {existingProfile?.isPhotoVerified ? (
                  <p className="text-sm text-muted-foreground">
                    프로필 사진이 등록되었습니다. 다른 회원들이 회원님을 더 신뢰할 수 있습니다.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      프로필 사진을 등록하면 다른 회원들이 회원님을 더 쉽게 알아볼 수 있습니다.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="프로필 사진 URL 입력"
                        value={profileImageUrl}
                        onChange={(e) => setProfileImageUrl(e.target.value)}
                        className="flex-1"
                        data-testid="input-profile-image"
                      />
                      <Button 
                        type="button"
                        onClick={handlePhotoSubmit}
                        disabled={photoVerifyMutation.isPending}
                        data-testid="button-upload-photo"
                      >
                        {photoVerifyMutation.isPending ? "등록 중..." : "사진 등록"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
