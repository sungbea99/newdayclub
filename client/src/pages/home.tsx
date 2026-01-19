import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CategoryIcon, CategoryBadge } from "@/components/category-icon";
import { getCategoryImage } from "@/components/category-images";
import { VerificationBadges } from "@/components/verification-badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Activity, Profile } from "@shared/schema";
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  ArrowRight,
  Clock,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

function ActivityCard({ activity, author }: { activity: Activity; author?: Profile }) {
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
            
            {author && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={author.profileImages?.[0]} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {author.nickname?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{author.nickname || "익명"}</p>
                </div>
                <VerificationBadges 
                  isPhoneVerified={author.isPhoneVerified || false}
                  isPhotoVerified={author.isPhotoVerified || false}
                  activityCount={author.activityCount || 0}
                  averageRating={author.averageRating || 0}
                />
              </div>
            )}
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

export default function Home() {
  const { user } = useAuth();
  
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profiles/me"],
  });

  const upcomingActivities = activities?.slice(0, 3) || [];
  const recommendedActivities = activities?.slice(0, 6) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
      <section className="mb-10">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 md:p-8">
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">
                안녕하세요, {profile?.nickname || user?.firstName || "회원"}님
              </h1>
              <p className="text-xs md:text-sm text-primary font-medium mb-1">
                대표 5060 여가생활 커뮤니티
              </p>
              <p className="text-sm text-muted-foreground hidden md:block">
                오늘도 즐거운 동행을 찾아보세요!
              </p>
            </div>
            
            <div className="flex-shrink-0">
              {!profileLoading && !profile ? (
                <div className="p-3 md:p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-right max-w-[180px] md:max-w-none">
                  <p className="text-xs md:text-sm text-amber-800 dark:text-amber-200 mb-2">
                    프로필을 완성하면 더 정확한 추천을 받을 수 있어요!
                  </p>
                  <Button asChild size="sm" data-testid="button-complete-profile">
                    <Link href="/profile/edit">프로필 작성하기</Link>
                  </Button>
                </div>
              ) : profile && (
                <div className="text-right">
                  <div className="mb-2">
                    <span className="text-sm text-muted-foreground">프로필 완성도</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${profile.profileCompleteness || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{profile.profileCompleteness || 0}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold">추천 동행</h2>
          </div>
          <Link href="/activities">
            <Button variant="ghost" className="gap-1" data-testid="link-view-all-activities">
              전체보기
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activitiesLoading ? (
            <>
              <ActivityCardSkeleton />
              <ActivityCardSkeleton />
              <ActivityCardSkeleton />
            </>
          ) : recommendedActivities.length > 0 ? (
            recommendedActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-muted/30 rounded-xl">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">아직 등록된 동행이 없습니다</h3>
              <p className="text-muted-foreground mb-4">첫 번째 동행 모집을 시작해보세요!</p>
              <Button asChild data-testid="button-create-first-activity">
                <Link href="/activities/new">동행 모집하기</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold">다가오는 일정</h2>
          </div>
        </div>
        
        {upcomingActivities.length > 0 ? (
          <div className="space-y-4">
            {upcomingActivities.map((activity) => (
              <Link key={activity.id} href={`/activities/${activity.id}`}>
                <Card className="hover-elevate cursor-pointer" data-testid={`upcoming-${activity.id}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                      <img 
                        src={activity.images?.[0] || getCategoryImage(activity.category)} 
                        alt={activity.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{activity.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {activity.activityDate 
                          ? format(new Date(activity.activityDate), "M월 d일 (EEE) HH:mm", { locale: ko })
                          : "날짜 미정"
                        }
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <CalendarDays className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">예정된 일정이 없습니다</p>
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <Card className="bg-gradient-to-r from-primary to-primary/80">
          <CardContent className="p-6 md:p-8 text-primary-foreground">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  새로운 동행을 모집해보세요
                </h3>
                <p className="opacity-90">
                  함께할 동행자를 직접 모집하고 즐거운 활동을 계획해보세요.
                </p>
              </div>
              <Button variant="secondary" size="lg" asChild data-testid="button-create-activity">
                <Link href="/activities/new">
                  동행 모집하기
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
