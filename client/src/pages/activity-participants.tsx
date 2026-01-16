import { useParams, useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Activity, ActivityParticipant, Profile } from "@shared/schema";
import { ArrowLeft, Check, X, MessageCircle, Clock, UserCheck, UserX } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

type ParticipantWithProfile = ActivityParticipant & { profile?: Profile };

export default function ActivityParticipants() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: activity, isLoading: activityLoading } = useQuery<Activity>({
    queryKey: ["/api/activities", id],
    enabled: !!id,
  });

  const { data: participants, isLoading: participantsLoading } = useQuery<ParticipantWithProfile[]>({
    queryKey: ["/api/activities", id, "participants"],
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ participantId, status }: { participantId: string; status: string }) =>
      apiRequest("PATCH", `/api/participants/${participantId}`, { status }),
    onSuccess: (_, variables) => {
      const statusText = variables.status === "approved" ? "수락" : "거절";
      toast({
        title: `신청 ${statusText}됨`,
        description: `참여 신청이 ${statusText}되었습니다.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/activities", id, "participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities", id] });
    },
    onError: () => {
      toast({
        title: "처리 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (participantId: string) => {
    updateStatusMutation.mutate({ participantId, status: "approved" });
  };

  const handleReject = (participantId: string) => {
    updateStatusMutation.mutate({ participantId, status: "rejected" });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  const statusLabels: Record<string, string> = {
    pending: "대기중",
    approved: "수락됨",
    rejected: "거절됨",
  };

  const isLoading = activityLoading || participantsLoading;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
        <Skeleton className="h-10 w-32 mb-6" />
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
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

  const pendingParticipants = participants?.filter(p => p.status === "pending") || [];
  const approvedParticipants = participants?.filter(p => p.status === "approved") || [];
  const rejectedParticipants = participants?.filter(p => p.status === "rejected") || [];

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
        <h1 className="text-2xl md:text-3xl font-bold mb-2">신청자 관리</h1>
        <p className="text-muted-foreground">{activity.title}</p>
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            대기: {pendingParticipants.length}명
          </Badge>
          <Badge variant="outline" className="gap-1">
            <UserCheck className="w-3 h-3" />
            수락: {approvedParticipants.length}명
          </Badge>
          <Badge variant="outline" className="gap-1">
            <UserX className="w-3 h-3" />
            거절: {rejectedParticipants.length}명
          </Badge>
        </div>
      </div>

      {pendingParticipants.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              대기 중인 신청
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingParticipants.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                onApprove={() => handleApprove(participant.id)}
                onReject={() => handleReject(participant.id)}
                statusColors={statusColors}
                statusLabels={statusLabels}
                showActions
                isPending={updateStatusMutation.isPending}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {approvedParticipants.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-500" />
              수락된 참여자
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {approvedParticipants.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                statusColors={statusColors}
                statusLabels={statusLabels}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {rejectedParticipants.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-500" />
              거절된 신청
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rejectedParticipants.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                statusColors={statusColors}
                statusLabels={statusLabels}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {(!participants || participants.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">아직 참여 신청이 없습니다.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ParticipantCard({ 
  participant, 
  onApprove, 
  onReject, 
  statusColors, 
  statusLabels,
  showActions = false,
  isPending = false,
}: { 
  participant: ParticipantWithProfile;
  onApprove?: () => void;
  onReject?: () => void;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  showActions?: boolean;
  isPending?: boolean;
}) {
  return (
    <div 
      className="flex items-start gap-4 p-4 rounded-lg border bg-card"
      data-testid={`participant-${participant.id}`}
    >
      <Link href={`/profile/${participant.userId}`}>
        <Avatar className="w-12 h-12 cursor-pointer">
          <AvatarImage src={participant.profile?.profileImages?.[0]} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {participant.profile?.nickname?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
      </Link>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link href={`/profile/${participant.userId}`}>
            <span className="font-medium hover:underline cursor-pointer">
              {participant.profile?.nickname || "익명"}
            </span>
          </Link>
          <Badge className={statusColors[participant.status || "pending"]}>
            {statusLabels[participant.status || "pending"]}
          </Badge>
        </div>
        
        {participant.message && (
          <div className="flex items-start gap-2 mt-2 p-3 rounded-lg bg-muted/50">
            <MessageCircle className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">{participant.message}</p>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-2">
          {participant.appliedAt && formatDistanceToNow(new Date(participant.appliedAt), { 
            addSuffix: true, 
            locale: ko 
          })}
        </p>
      </div>

      {showActions && (
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isPending}
            className="gap-1"
            data-testid={`button-approve-${participant.id}`}
          >
            <Check className="w-4 h-4" />
            수락
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            disabled={isPending}
            className="gap-1"
            data-testid={`button-reject-${participant.id}`}
          >
            <X className="w-4 h-4" />
            거절
          </Button>
        </div>
      )}
    </div>
  );
}
