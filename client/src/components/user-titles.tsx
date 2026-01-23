import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface UserTitlesProps {
  userId: string;
  isOwnProfile?: boolean;
  showGenerateButton?: boolean;
}

const titleColors = [
  "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0",
  "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0",
  "bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0",
  "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0",
  "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0",
];

export function UserTitles({ userId, isOwnProfile = false, showGenerateButton = false }: UserTitlesProps) {
  const { toast } = useToast();

  const { data: titlesData, isLoading } = useQuery<{ titles: string[]; updatedAt?: string }>({
    queryKey: ["/api/profiles", userId, "titles"],
  });

  const generateMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/profiles/${userId}/generate-titles`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles", userId, "titles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles", userId] });
      toast({
        title: "칭호가 생성되었습니다",
        description: "AI가 활동 내역을 분석하여 새 칭호를 생성했어요!",
      });
    },
    onError: () => {
      toast({
        title: "칭호 생성 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const titles = titlesData?.titles || [];

  if (isLoading) {
    return (
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
        <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  if (titles.length === 0 && !isOwnProfile) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {titles.map((title, index) => (
        <Tooltip key={title}>
          <TooltipTrigger asChild>
            <Badge 
              className={`${titleColors[index % titleColors.length]} px-3 py-1 text-sm font-medium`}
              data-testid={`badge-title-${index}`}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {title}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>AI가 분석한 활동 기반 칭호</p>
          </TooltipContent>
        </Tooltip>
      ))}
      
      {isOwnProfile && showGenerateButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          data-testid="button-generate-titles"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${generateMutation.isPending ? "animate-spin" : ""}`} />
          {titles.length === 0 ? "칭호 생성" : "칭호 갱신"}
        </Button>
      )}
    </div>
  );
}

export function UserTitlesBadges({ titles }: { titles?: string[] | null }) {
  if (!titles || titles.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {titles.slice(0, 2).map((title, index) => (
        <Badge 
          key={title}
          variant="secondary"
          className="text-xs px-2 py-0.5"
          data-testid={`badge-title-mini-${index}`}
        >
          {title}
        </Badge>
      ))}
    </div>
  );
}
