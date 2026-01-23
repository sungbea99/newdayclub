import { Link, useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryBadge } from "@/components/category-icon";
import { VerificationBadges } from "@/components/verification-badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile, Activity, CommunityPost, Friend } from "@shared/schema";
import { 
  Edit, 
  MapPin, 
  Calendar, 
  Users, 
  Star,
  Grid3X3,
  List,
  MessageCircle,
  UserPlus,
  UserCheck,
  Clock,
  UserMinus
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function ProfilePage() {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const isOwnProfile = !id || id === user?.id;
  const profileId = id || user?.id;

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: isOwnProfile ? ["/api/profiles/me"] : ["/api/profiles", profileId],
    enabled: !!profileId,
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/profiles", profileId, "activities"],
    enabled: !!profileId,
  });

  const { data: posts } = useQuery<CommunityPost[]>({
    queryKey: ["/api/profiles", profileId, "posts"],
    enabled: !!profileId,
  });

  const { data: friendshipData } = useQuery<{ friendship: Friend | null }>({
    queryKey: ["/api/friends/status", profileId],
    enabled: !isOwnProfile && !!profileId,
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/friends", { friendId: profileId }),
    onSuccess: () => {
      toast({ title: "친구 신청을 보냈습니다" });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/status", profileId] });
    },
    onError: () => {
      toast({ title: "친구 신청 실패", variant: "destructive" });
    },
  });

  const startChatMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/chat/direct", { userId: profileId }),
    onSuccess: (data: any) => {
      navigate(`/chat?room=${data.id}`);
    },
    onError: () => {
      toast({ title: "채팅 시작 실패", variant: "destructive" });
    },
  });

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
        <div className="flex flex-col items-center mb-8">
          <Skeleton className="w-32 h-32 rounded-full mb-4" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  if (!profile && !isOwnProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8 text-center">
        <h1 className="text-2xl font-bold mb-4">프로필을 찾을 수 없습니다</h1>
        <Button asChild>
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  const calculateAge = (birthYear?: number | null) => {
    if (!birthYear) return null;
    return new Date().getFullYear() - birthYear;
  };

  const friendship = friendshipData?.friendship;
  const isFriend = friendship?.status === "accepted";
  const isPending = friendship?.status === "pending";
  const isSentByMe = friendship?.userId === user?.id;

  const renderFriendButton = () => {
    if (isFriend) {
      return (
        <Button variant="secondary" disabled data-testid="button-friend-status">
          <UserCheck className="w-4 h-4 mr-2" />
          친구
        </Button>
      );
    }
    
    if (isPending) {
      if (isSentByMe) {
        return (
          <Button variant="outline" disabled data-testid="button-friend-pending">
            <Clock className="w-4 h-4 mr-2" />
            수락 대기중
          </Button>
        );
      } else {
        return (
          <Button variant="outline" disabled data-testid="button-friend-pending">
            <Clock className="w-4 h-4 mr-2" />
            요청 받음
          </Button>
        );
      }
    }
    
    return (
      <Button 
        onClick={() => sendFriendRequestMutation.mutate()}
        disabled={sendFriendRequestMutation.isPending}
        data-testid="button-add-friend"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        친구 신청
      </Button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
      <Card className="mb-6">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-28 h-28 md:w-32 md:h-32 ring-4 ring-primary/20">
              <AvatarImage src={profile?.profileImages?.[0] || user?.profileImageUrl || undefined} />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {profile?.nickname?.charAt(0) || user?.firstName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {profile?.nickname || `${user?.firstName} ${user?.lastName}` || "사용자"}
                </h1>
                <VerificationBadges 
                  isPhoneVerified={profile?.isPhoneVerified || false}
                  isPhotoVerified={profile?.isPhotoVerified || false}
                  activityCount={profile?.activityCount || 0}
                  averageRating={profile?.averageRating || 0}
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                {profile?.birthYear && (
                  <span>{calculateAge(profile.birthYear)}세</span>
                )}
                {profile?.gender && (
                  <span>{profile.gender}</span>
                )}
                {profile?.region && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.region}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-primary" />
                  <span>활동 {profile?.activityCount || 0}회</span>
                </div>
                {profile?.averageRating && profile.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{(profile.averageRating / 10).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              {isOwnProfile ? (
                <div className="flex flex-col md:flex-row gap-2">
                  <Button asChild className="w-full md:w-auto" data-testid="button-edit-profile">
                    <Link href="/profile/edit">
                      <Edit className="w-4 h-4 mr-2" />
                      프로필 편집
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full md:w-auto" data-testid="button-manage-friends">
                    <Link href="/friends">
                      <Users className="w-4 h-4 mr-2" />
                      친구 관리
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  {renderFriendButton()}
                  <Button 
                    variant="outline" 
                    onClick={() => startChatMutation.mutate()}
                    disabled={startChatMutation.isPending}
                    data-testid="button-message"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {profile?.bio && (
            <p className="mt-6 text-muted-foreground">{profile.bio}</p>
          )}
          
          {profile?.interests && profile.interests.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">관심 분야</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <CategoryBadge key={interest} category={interest} />
                ))}
              </div>
            </div>
          )}
          
          {profile?.activityStyles && profile.activityStyles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">활동 스타일</h3>
              <div className="flex flex-wrap gap-2">
                {profile.activityStyles.map((style) => (
                  <Badge key={style} variant="outline">#{style}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {isOwnProfile && profile && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">프로필 완성도</span>
                <span className="text-sm font-bold text-primary">{profile.profileCompleteness || 0}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${profile.profileCompleteness || 0}%` }}
                />
              </div>
              {(profile.profileCompleteness || 0) < 100 && (
                <p className="text-xs text-muted-foreground mt-2">
                  프로필을 완성하면 더 많은 추천을 받을 수 있어요!
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {!profile && isOwnProfile && (
        <Card className="mb-6 border-dashed border-2">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-bold mb-2">프로필을 작성해주세요</h3>
            <p className="text-muted-foreground mb-4">
              취향과 관심사를 등록하면 맞춤 동행자를 추천받을 수 있어요.
            </p>
            <Button asChild data-testid="button-create-profile">
              <Link href="/profile/edit">프로필 작성하기</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="activities" className="gap-2" data-testid="tab-activities">
            <List className="w-4 h-4" />
            활동 내역
          </TabsTrigger>
          <TabsTrigger value="posts" className="gap-2" data-testid="tab-posts">
            <Grid3X3 className="w-4 h-4" />
            게시물
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="activities">
          {activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Link key={activity.id} href={`/activities/${activity.id}`}>
                  <Card className="hover-elevate cursor-pointer" data-testid={`activity-${activity.id}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                        {activity.images?.[0] ? (
                          <img 
                            src={activity.images[0]} 
                            alt={activity.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <CategoryBadge category={activity.category} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {activity.activityDate 
                            ? format(new Date(activity.activityDate), "yyyy.M.d", { locale: ko })
                            : "날짜 미정"
                          }
                        </p>
                      </div>
                      <Badge variant={activity.status === "모집중" ? "default" : "secondary"}>
                        {activity.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>아직 활동 내역이 없습니다</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="posts">
          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className="aspect-square bg-muted overflow-hidden"
                  data-testid={`post-${post.id}`}
                >
                  {post.images?.[0] ? (
                    <img 
                      src={post.images[0]} 
                      alt="게시물"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-2">
                      {post.content?.substring(0, 50)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Grid3X3 className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>아직 게시물이 없습니다</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
