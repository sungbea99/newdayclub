import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { CommunityPost, Profile } from "@shared/schema";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MoreHorizontal,
  Plus,
  Image,
  MapPin,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function PostCard({ post }: { post: CommunityPost & { author?: Profile; isLikedByMe?: boolean; isBookmarked?: boolean } }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);

  const likeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/community/${post.id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community"] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/bookmarks", { itemType: "post", itemId: post.id }),
    onSuccess: (data: any) => {
      setIsBookmarked(data.isBookmarked);
      toast({ 
        title: data.isBookmarked ? "게시글이 저장되었습니다" : "저장이 취소되었습니다" 
      });
    },
  });

  const handleShare = async () => {
    const shareData = {
      title: post.author?.nickname ? `${post.author.nickname}님의 게시글` : "뉴데이클럽 게시글",
      text: post.content || "",
      url: `${window.location.origin}/community/${post.id}`,
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

  const { data: comments } = useQuery<any[]>({
    queryKey: ["/api/community", post.id, "comments"],
    enabled: showComments,
  });

  const commentMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/community/${post.id}/comments`, { content: commentText }),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["/api/community", post.id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community"] });
      toast({ title: "댓글이 등록되었습니다." });
    },
  });

  return (
    <Card className="mb-4" data-testid={`post-${post.id}`}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <Link href={`/profile/${post.authorId}`}>
            <div className="flex items-center gap-3 cursor-pointer" data-testid="link-post-author">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.author?.profileImages?.[0]} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {post.author?.nickname?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.author?.nickname || "익명"}</p>
                <p className="text-xs text-muted-foreground">
                  {post.location && `${post.location} · `}
                  {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { 
                    addSuffix: true, 
                    locale: ko 
                  })}
                </p>
              </div>
            </div>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-post-more">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>신고하기</DropdownMenuItem>
              <DropdownMenuItem>공유하기</DropdownMenuItem>
              {post.authorId === user?.id && (
                <DropdownMenuItem className="text-destructive">삭제하기</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {post.images && post.images.length > 0 && (
          <div className="aspect-square bg-muted">
            <img 
              src={post.images[0]} 
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center gap-4 mb-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-2 ${post.isLikedByMe ? "text-red-500" : ""}`}
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              data-testid="button-like"
            >
              <Heart className={`w-5 h-5 ${post.isLikedByMe ? "fill-current" : ""}`} />
              <span>{post.likesCount || 0}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2" 
              onClick={() => setShowComments(!showComments)}
              data-testid="button-comment"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{post.commentsCount || 0}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2" 
              onClick={handleShare}
              data-testid="button-share"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <div className="flex-1" />
            <Button 
              variant="ghost" 
              size="icon" 
              className={isBookmarked ? "text-primary" : ""}
              onClick={() => bookmarkMutation.mutate()}
              disabled={bookmarkMutation.isPending}
              data-testid="button-bookmark"
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
            </Button>
          </div>

          {post.content && (
            <p className="text-sm">
              <span className="font-medium mr-2">{post.author?.nickname || "익명"}</span>
              {post.content}
            </p>
          )}

          {post.tags && post.tags.length > 0 && (
            <p className="text-sm text-primary mt-2">
              {post.tags.map((tag) => `#${tag}`).join(" ")}
            </p>
          )}

          {showComments && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex gap-2 mb-4">
                <Textarea
                  placeholder="댓글을 입력하세요..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[60px] text-sm"
                  data-testid="input-comment"
                />
                <Button 
                  size="sm"
                  onClick={() => commentMutation.mutate()}
                  disabled={!commentText.trim() || commentMutation.isPending}
                  data-testid="button-submit-comment"
                >
                  등록
                </Button>
              </div>
              
              {comments && comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-2" data-testid={`comment-${comment.id}`}>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {comment.author?.nickname?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium mr-2">{comment.author?.nickname || "익명"}</span>
                          {comment.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { 
                            addSuffix: true, 
                            locale: ko 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  첫 댓글을 남겨보세요!
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PostCardSkeleton() {
  return (
    <Card className="mb-4">
      <CardContent className="p-0">
        <div className="flex items-center gap-3 p-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="aspect-square" />
        <div className="p-4">
          <div className="flex gap-4 mb-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function CreatePostDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/community", { 
      content, 
      location,
      postType: "activity",
    }),
    onSuccess: () => {
      toast({
        title: "게시물 등록 완료",
        description: "게시물이 성공적으로 등록되었습니다.",
      });
      setIsOpen(false);
      setContent("");
      setLocation("");
      queryClient.invalidateQueries({ queryKey: ["/api/community"] });
    },
    onError: () => {
      toast({
        title: "등록 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full shadow-lg" data-testid="button-create-post">
          <Plus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>새 게시물</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="활동 내용을 공유해보세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px]"
            data-testid="input-post-content"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" data-testid="button-add-photo">
              <Image className="w-4 h-4" />
              사진 추가
            </Button>
            <Button variant="outline" size="sm" className="gap-2" data-testid="button-add-location">
              <MapPin className="w-4 h-4" />
              위치 추가
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => createMutation.mutate()}
            disabled={!content.trim() || createMutation.isPending}
            data-testid="button-submit-post"
          >
            {createMutation.isPending ? "게시 중..." : "게시하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Community() {
  const [activeTab, setActiveTab] = useState("recommended");

  const { data: posts, isLoading } = useQuery<(CommunityPost & { author?: Profile })[]>({
    queryKey: ["/api/community", activeTab],
  });

  return (
    <div className="max-w-xl mx-auto px-4 md:px-0 py-4 pb-24 md:pb-8">
      <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-lg -mx-4 px-4 py-3 border-b border-border">
        <h1 className="text-xl font-bold mb-3">커뮤니티</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="following" data-testid="tab-friends">친구</TabsTrigger>
            <TabsTrigger value="recommended" data-testid="tab-recommended">추천</TabsTrigger>
            <TabsTrigger value="popular" data-testid="tab-popular">인기</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">게시물이 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                첫 번째 게시물을 작성해보세요!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <CreatePostDialog />
    </div>
  );
}
