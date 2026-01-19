import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatRoom, Message, Profile } from "@shared/schema";
import { 
  MessageCircle, 
  Send, 
  Search, 
  ArrowLeft,
  Users,
  MoreVertical,
  Phone,
  Video,
  Info
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { ko } from "date-fns/locale";

function ChatRoomList({ 
  rooms, 
  selectedRoom, 
  onSelectRoom 
}: { 
  rooms: ChatRoom[];
  selectedRoom: string | null;
  onSelectRoom: (id: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredRooms = rooms.filter((room) => 
    room.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="채팅방 검색..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-chat"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg hover-elevate text-left ${
                  selectedRoom === room.id ? "bg-muted" : ""
                }`}
                data-testid={`chat-room-${room.id}`}
              >
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {room.type === "group" ? (
                      <Users className="w-5 h-5" />
                    ) : (
                      room.name?.charAt(0) || "C"
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">{room.name || "채팅방"}</p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {room.updatedAt && formatChatTime(new Date(room.updatedAt))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {room.type === "group" && (
                      <Badge variant="outline" className="text-xs">
                        {room.participants?.length || 0}명
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>채팅방이 없습니다</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function formatChatTime(date: Date): string {
  if (isToday(date)) {
    return format(date, "HH:mm");
  } else if (isYesterday(date)) {
    return "어제";
  } else {
    return format(date, "M/d", { locale: ko });
  }
}

function ChatMessages({ 
  roomId, 
  currentUserId 
}: { 
  roomId: string;
  currentUserId: string;
}) {
  const [newMessage, setNewMessage] = useState("");

  const { data: room } = useQuery<ChatRoom>({
    queryKey: ["/api/chat/rooms", roomId],
    enabled: !!roomId,
  });

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/chat/rooms", roomId, "messages"],
    enabled: !!roomId,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => 
      apiRequest("POST", `/api/chat/rooms/${roomId}/messages`, { content }),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms", roomId, "messages"] });
    },
  });

  const handleSend = () => {
    if (newMessage.trim()) {
      sendMutation.mutate(newMessage.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {room?.type === "group" ? (
                <Users className="w-4 h-4" />
              ) : (
                room?.name?.charAt(0) || "C"
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{room?.name || "채팅방"}</h3>
            {room?.type === "group" && (
              <p className="text-sm text-muted-foreground">
                {room.participants?.length || 0}명 참여중
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" data-testid="button-chat-info">
            <Info className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" data-testid="button-chat-more">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-2/3" />
            <Skeleton className="h-16 w-1/2 ml-auto" />
            <Skeleton className="h-16 w-2/3" />
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              const showTime = index === messages.length - 1 || 
                messages[index + 1]?.senderId !== message.senderId;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] ${isOwn ? "order-2" : ""}`}>
                    {!isOwn && (
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">U</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {message.senderId}
                        </span>
                      </div>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                    {showTime && message.createdAt && (
                      <p className={`text-xs text-muted-foreground mt-1 ${isOwn ? "text-right" : ""}`}>
                        {format(new Date(message.createdAt), "HH:mm")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
            <p>대화를 시작해보세요!</p>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Input
            placeholder="메시지를 입력하세요..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            data-testid="input-message"
          />
          <Button 
            onClick={handleSend}
            disabled={!newMessage.trim() || sendMutation.isPending}
            data-testid="button-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const roomFromUrl = urlParams.get("room");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(roomFromUrl);

  useEffect(() => {
    if (roomFromUrl) {
      setSelectedRoom(roomFromUrl);
    }
  }, [roomFromUrl]);

  const { data: rooms, isLoading } = useQuery<ChatRoom[]>({
    queryKey: ["/api/chat/rooms"],
  });

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (isMobile && selectedRoom) {
    return (
      <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col">
        <div className="p-2 border-b border-border">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedRoom(null)}
            data-testid="button-back-to-list"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </div>
        <div className="flex-1">
          <ChatMessages roomId={selectedRoom} currentUserId={user?.id || ""} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      <div className="h-full flex">
        <div className={`${selectedRoom ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 flex-col border-r border-border`}>
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold">채팅</h1>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : rooms && rooms.length > 0 ? (
            <ChatRoomList 
              rooms={rooms} 
              selectedRoom={selectedRoom}
              onSelectRoom={setSelectedRoom}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <MessageCircle className="w-16 h-16 mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">채팅방이 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                동행에 참여하면 채팅방이 자동으로 생성됩니다
              </p>
              <Button asChild data-testid="link-find-activities">
                <Link href="/activities">동행 찾아보기</Link>
              </Button>
            </div>
          )}
        </div>

        <div className={`${selectedRoom ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
          {selectedRoom ? (
            <ChatMessages roomId={selectedRoom} currentUserId={user?.id || ""} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
              <p>채팅방을 선택해주세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
