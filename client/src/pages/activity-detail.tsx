import { Link, useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { CategoryBadge } from "@/components/category-icon";
import { getCategoryImage } from "@/components/category-images";
import { VerificationBadges } from "@/components/verification-badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Activity, Profile, ActivityParticipant } from "@shared/schema";
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  ArrowLeft,
  Clock,
  DollarSign,
  MessageCircle,
  Share2,
  Bookmark,
  Send
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { data: activity, isLoading: activityLoading } = useQuery<Activity>({
    queryKey: ["/api/activities", id],
    enabled: !!id,
  });

  const { data: author } = useQuery<Profile>({
    queryKey: ["/api/profiles", activity?.authorId],
    enabled: !!activity?.authorId,
  });

  const { data: participants } = useQuery<ActivityParticipant[]>({
    queryKey: ["/api/activities", id, "participants"],
    enabled: !!id,
  });

  // Check if activity is bookmarked
  const { data: bookmarkStatus } = useQuery<{ isBookmarked: boolean }>({
    queryKey: ["/api/bookmarks/check", { itemType: "activity", itemId: id }],
    enabled: !!id && !!user,
  });

  // Update bookmark state when data is fetched
  useEffect(() => {
    if (bookmarkStatus?.isBookmarked !== undefined) {
      setIsBookmarked(bookmarkStatus.isBookmarked);
    }
  }, [bookmarkStatus]);

  const bookmarkMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/bookmarks", { itemType: "activity", itemId: id }),
    onSuccess: (data: any) => {
      setIsBookmarked(data.isBookmarked);
      toast({ 
        title: data.isBookmarked ? "동행이 저장되었습니다" : "저장이 취소되었습니다" 
      });
    },
  });

  const handleShare = async () => {
    const shareData = {
      title: activity?.title || "동락 동행",
      text: activity?.description || "",
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          copyToClipboard(shareData.url);
        }
      }
    } else {
      copyToClipboard(shareData.url);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "링크가 복사되었습니다" });
  };

  const applyMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/activities/${id}/apply`, { message }),
    onSuccess: () => {
      toast({
        title: "참여 신청 완료",
        description: "작성자가 신청을 확인하면 알려드릴게요.",
      });
      setIsApplyDialogOpen(false);
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/activities", id] });
    },
    onError: () => {
      toast({
        title: "신청 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const statusColors: Record<string, string> = {
    "모집중": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    "마감임박": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    "마감": "bg-muted text-muted-foreground",
  };

  if (activityLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>
        <Skeleton className="aspect-video rounded-xl mb-6" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-6" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="h-40" />
          </div>
          <Skeleton className="h-60" />
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8 text-center">
        <h1 className="text-2xl font-bold mb-4">동행을 찾을 수 없습니다</h1>
        <Button asChild>
          <Link href="/activities">목록으로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  const isAuthor = user?.id === activity.authorId;
  const canApply = !isAuthor && activity.status === "모집중";

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate("/activities")}
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        목록으로
      </Button>

      <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-muted">
        <img 
          src={activity.images?.[0] || getCategoryImage(activity.category)} 
          alt={activity.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Badge className={statusColors[activity.status || "모집중"]}>
          {activity.status}
        </Badge>
        <CategoryBadge category={activity.category} />
        {activity.tags?.map((tag) => (
          <Badge key={tag} variant="outline">#{tag}</Badge>
        ))}
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-6">{activity.title}</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">일시</p>
                    <p className="font-medium">
                      {activity.activityDate 
                        ? format(new Date(activity.activityDate), "M월 d일 (EEEE) HH:mm", { locale: ko })
                        : "날짜 미정"
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">장소</p>
                    <p className="font-medium">{activity.location || "장소 미정"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">인원</p>
                    <p className="font-medium">{activity.currentParticipants}/{activity.maxParticipants}명</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">예상 비용</p>
                    <p className="font-medium">{activity.estimatedCost || "무료"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">활동 소개</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {activity.description || "상세 설명이 없습니다."}
              </p>
            </CardContent>
          </Card>

          {activity.ageRange || activity.genderRestriction || activity.activityLevel ? (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">참여 조건</h3>
                <div className="flex flex-wrap gap-2">
                  {activity.ageRange && (
                    <Badge variant="outline">{activity.ageRange}</Badge>
                  )}
                  {activity.genderRestriction && activity.genderRestriction !== "무관" && (
                    <Badge variant="outline">{activity.genderRestriction}</Badge>
                  )}
                  {activity.activityLevel && (
                    <Badge variant="outline">{activity.activityLevel}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">모집자</h3>
              <Link href={`/profile/${activity.authorId}`}>
                <div className="flex items-center gap-3 cursor-pointer hover-elevate p-2 -m-2 rounded-lg" data-testid="link-author-profile">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={author?.profileImages?.[0]} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {author?.nickname?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{author?.nickname || "익명"}</p>
                    <div className="flex items-center gap-1">
                      <VerificationBadges 
                        isPhoneVerified={author?.isPhoneVerified ?? undefined}
                        isPhotoVerified={author?.isPhotoVerified ?? undefined}
                        activityCount={author?.activityCount || 0}
                        averageRating={author?.averageRating || 0}
                      />
                    </div>
                  </div>
                </div>
              </Link>
              {author?.bio && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                  {author.bio}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className={isBookmarked ? "text-primary border-primary" : ""}
              onClick={() => bookmarkMutation.mutate()}
              disabled={bookmarkMutation.isPending}
              data-testid="button-bookmark"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleShare}
              data-testid="button-share"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {canApply && (
            <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg" data-testid="button-apply">
                  참여 신청하기
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>참여 신청</DialogTitle>
                  <DialogDescription>
                    모집자에게 간단한 인사 메시지를 남겨주세요.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="안녕하세요! 함께 참여하고 싶습니다..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px]"
                  data-testid="input-apply-message"
                />
                <DialogFooter>
                  <Button 
                    onClick={() => applyMutation.mutate()}
                    disabled={applyMutation.isPending}
                    data-testid="button-submit-apply"
                  >
                    {applyMutation.isPending ? "신청 중..." : "신청하기"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {isAuthor && (
            <div className="space-y-2">
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/activities/${id}/edit`}>수정하기</Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/activities/${id}/participants`}>신청자 관리</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
