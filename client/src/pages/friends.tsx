import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import type { Friend, Profile } from "@shared/schema";
import { 
  Users, 
  UserPlus,
  Check,
  X,
  MessageCircle,
  Trash2
} from "lucide-react";

type FriendWithProfile = Friend & { profile?: Profile };

function FriendCard({ 
  friend, 
  currentUserId,
  onMessage,
  onRemove 
}: { 
  friend: FriendWithProfile;
  currentUserId: string;
  onMessage: () => void;
  onRemove: () => void;
}) {
  const profile = friend.profile;
  
  return (
    <Card data-testid={`friend-card-${friend.id}`}>
      <CardContent className="p-4 flex items-center gap-4">
        <Link href={`/profile/${friend.userId === currentUserId ? friend.friendId : friend.userId}`}>
          <Avatar className="w-14 h-14 cursor-pointer hover:ring-2 ring-primary">
            <AvatarImage src={profile?.profileImages?.[0]} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile?.nickname?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${friend.userId === currentUserId ? friend.friendId : friend.userId}`}>
            <h3 className="font-medium hover:underline cursor-pointer">{profile?.nickname || "사용자"}</h3>
          </Link>
          <p className="text-sm text-muted-foreground truncate">
            {profile?.region || "지역 미설정"} · {profile?.interests?.slice(0, 2).join(", ") || "관심사 없음"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            size="icon" 
            variant="outline" 
            onClick={onMessage}
            data-testid="button-message-friend"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={onRemove}
            data-testid="button-remove-friend"
          >
            <Trash2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FriendRequestCard({ 
  request, 
  onAccept, 
  onReject 
}: { 
  request: FriendWithProfile;
  onAccept: () => void;
  onReject: () => void;
}) {
  const profile = request.profile;
  
  return (
    <Card data-testid={`request-card-${request.id}`}>
      <CardContent className="p-4 flex items-center gap-4">
        <Link href={`/profile/${request.userId}`}>
          <Avatar className="w-14 h-14 cursor-pointer hover:ring-2 ring-primary">
            <AvatarImage src={profile?.profileImages?.[0]} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile?.nickname?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${request.userId}`}>
            <h3 className="font-medium hover:underline cursor-pointer">{profile?.nickname || "사용자"}</h3>
          </Link>
          <p className="text-sm text-muted-foreground truncate">
            {profile?.region || "지역 미설정"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={onAccept}
            data-testid="button-accept-request"
          >
            <Check className="w-4 h-4 mr-1" />
            수락
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onReject}
            data-testid="button-reject-request"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FriendsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: friends, isLoading: friendsLoading } = useQuery<FriendWithProfile[]>({
    queryKey: ["/api/friends"],
  });

  const { data: requests, isLoading: requestsLoading } = useQuery<FriendWithProfile[]>({
    queryKey: ["/api/friends/requests"],
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/friends/${id}`, { status: "accepted" }),
    onSuccess: () => {
      toast({ title: "친구 요청을 수락했습니다" });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/friends/${id}`, { status: "rejected" }),
    onSuccess: () => {
      toast({ title: "친구 요청을 거절했습니다" });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/friends/${id}`),
    onSuccess: () => {
      toast({ title: "친구를 삭제했습니다" });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
    },
  });

  const startChatMutation = useMutation({
    mutationFn: (userId: string) => apiRequest("POST", "/api/chat/direct", { userId }),
    onSuccess: (data: any) => {
      window.location.href = `/chat?room=${data.id}`;
    },
  });

  const acceptedFriends = friends?.filter(f => f.status === "accepted") || [];
  const pendingRequests = requests || [];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">친구 관리</h1>
        <p className="text-muted-foreground">친구 목록과 요청을 관리하세요</p>
      </div>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="friends" className="gap-2" data-testid="tab-friends">
            <Users className="w-4 h-4" />
            친구 목록
            {acceptedFriends.length > 0 && (
              <Badge variant="secondary" className="ml-1">{acceptedFriends.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2" data-testid="tab-requests">
            <UserPlus className="w-4 h-4" />
            친구 요청
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          {friendsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Skeleton className="w-14 h-14 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : acceptedFriends.length > 0 ? (
            <div className="space-y-4">
              {acceptedFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  currentUserId={user?.id || ""}
                  onMessage={() => {
                    const friendUserId = friend.userId === user?.id ? friend.friendId : friend.userId;
                    startChatMutation.mutate(friendUserId);
                  }}
                  onRemove={() => removeMutation.mutate(friend.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-xl">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">아직 친구가 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                동행 활동을 통해 새로운 친구를 만들어보세요!
              </p>
              <Button asChild>
                <Link href="/activities">동행 찾기</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {requestsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Skeleton className="w-14 h-14 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  onAccept={() => acceptMutation.mutate(request.id)}
                  onReject={() => rejectMutation.mutate(request.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-xl">
              <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">새로운 친구 요청이 없습니다</h3>
              <p className="text-muted-foreground">
                친구 요청이 오면 여기에 표시됩니다
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
