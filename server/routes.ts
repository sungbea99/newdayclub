import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // Profile routes
  app.get("/api/profiles/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.get("/api/profiles/:id", async (req, res) => {
    try {
      // Try to find by userId first (most common case from frontend)
      let profile = await storage.getProfile(req.params.id);
      // If not found, try by profile id
      if (!profile) {
        profile = await storage.getProfileById(req.params.id);
      }
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profiles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getProfile(userId);
      if (existing) {
        return res.status(400).json({ message: "Profile already exists" });
      }
      const profile = await storage.createProfile({ ...req.body, userId });
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.patch("/api/profiles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let profile = await storage.getProfile(userId);
      
      if (!profile) {
        profile = await storage.createProfile({ ...req.body, userId });
      } else {
        profile = await storage.updateProfile(userId, req.body);
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // SMS 인증번호 발송
  app.post("/api/profiles/send-verification-code", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }
      
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      // Save verification code
      await storage.createPhoneVerificationCode({
        userId,
        phoneNumber,
        code,
        expiresAt,
      });
      
      // Send SMS via Twilio
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
      
      if (!accountSid || !authToken || !twilioPhone) {
        console.error("Twilio credentials not configured");
        return res.status(500).json({ message: "SMS service not configured" });
      }
      
      const twilio = require("twilio")(accountSid, authToken);
      
      await twilio.messages.create({
        body: `[동락] 인증번호는 ${code}입니다. 5분 내에 입력해주세요.`,
        from: twilioPhone,
        to: phoneNumber,
      });
      
      res.json({ success: true, message: "Verification code sent" });
    } catch (error) {
      console.error("Error sending verification code:", error);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  // SMS 인증번호 확인
  app.post("/api/profiles/verify-phone", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { phoneNumber, code } = req.body;
      
      if (!phoneNumber || !code) {
        return res.status(400).json({ message: "Phone number and code are required" });
      }
      
      // Verify code
      const verificationCode = await storage.getValidVerificationCode(userId, phoneNumber, code);
      
      if (!verificationCode) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }
      
      // Mark code as used
      await storage.markVerificationCodeAsUsed(verificationCode.id);
      
      // Update profile
      const profile = await storage.updateProfile(userId, { isPhoneVerified: true });
      
      res.json(profile);
    } catch (error) {
      console.error("Error verifying phone:", error);
      res.status(500).json({ message: "Failed to verify phone" });
    }
  });

  app.post("/api/profiles/verify-photo", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { imageUrl } = req.body;
      
      let profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const profileImages = profile.profileImages || [];
      profileImages.unshift(imageUrl);
      
      profile = await storage.updateProfile(userId, { 
        profileImages: profileImages.slice(0, 5),
        isPhotoVerified: true 
      });
      res.json(profile);
    } catch (error) {
      console.error("Error verifying photo:", error);
      res.status(500).json({ message: "Failed to verify photo" });
    }
  });

  app.get("/api/profiles/:id/activities", async (req, res) => {
    try {
      const activities = await storage.getActivitiesByUser(req.params.id);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching user activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get("/api/profiles/:id/posts", async (req, res) => {
    try {
      const posts = await storage.getPostsByUser(req.params.id);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Activity routes
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const activities = await storage.getActivities(limit);
      
      // Enrich activities with author info
      const enrichedActivities = await Promise.all(
        activities.map(async (activity) => {
          const author = await storage.getProfile(activity.authorId);
          return { ...activity, author };
        })
      );
      
      res.json(enrichedActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get("/api/activities/:id", async (req, res) => {
    try {
      const activity = await storage.getActivity(req.params.id);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Enrich with author info
      const author = await storage.getProfile(activity.authorId);
      res.json({ ...activity, author });
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  app.post("/api/activities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activityData = {
        ...req.body,
        authorId: userId,
        activityDate: req.body.activityDate ? new Date(req.body.activityDate) : undefined,
      };
      const activity = await storage.createActivity(activityData);
      res.json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  app.patch("/api/activities/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activity = await storage.getActivity(req.params.id);
      
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      if (activity.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updated = await storage.updateActivity(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating activity:", error);
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  app.delete("/api/activities/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activity = await storage.getActivity(req.params.id);
      
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      if (activity.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.deleteActivity(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting activity:", error);
      res.status(500).json({ message: "Failed to delete activity" });
    }
  });

  // Participants routes
  app.get("/api/activities/:id/participants", async (req, res) => {
    try {
      const participants = await storage.getParticipants(req.params.id);
      
      // Enrich participants with profile info
      const enrichedParticipants = await Promise.all(
        participants.map(async (participant) => {
          const profile = await storage.getProfile(participant.userId);
          return { ...participant, profile };
        })
      );
      
      res.json(enrichedParticipants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  app.post("/api/activities/:id/apply", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activityId = req.params.id;
      
      const existing = await storage.getParticipant(activityId, userId);
      if (existing) {
        return res.status(400).json({ message: "Already applied" });
      }
      
      const participant = await storage.createParticipant({
        activityId,
        userId,
        message: req.body.message,
      });
      res.json(participant);
    } catch (error) {
      console.error("Error applying to activity:", error);
      res.status(500).json({ message: "Failed to apply" });
    }
  });

  app.patch("/api/participants/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get the participant first to find the activity
      const participantData = await storage.getParticipantById(req.params.id);
      if (!participantData) {
        return res.status(404).json({ message: "Participant not found" });
      }
      
      // Get the activity to verify host authorization
      const activity = await storage.getActivity(participantData.activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Only the activity host can approve/reject participants
      if (activity.authorId !== userId) {
        return res.status(403).json({ message: "Only the activity host can manage participants" });
      }
      
      const updated = await storage.updateParticipantStatus(req.params.id, req.body.status);
      if (!updated) {
        return res.status(404).json({ message: "Failed to update participant" });
      }
      
      // Create or update chat room when participant is accepted
      if (req.body.status === "accepted") {
        let room = await storage.getChatRoomByActivityId(activity.id);
        if (!room) {
          room = await storage.createChatRoom({
            activityId: activity.id,
            type: "group",
            name: activity.title,
            participants: [activity.authorId, updated.userId],
          });
        } else {
          // Add participant to existing room
          await storage.addParticipantToChatRoom(room.id, updated.userId);
        }
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating participant:", error);
      res.status(500).json({ message: "Failed to update participant" });
    }
  });

  // Chat routes
  app.get("/api/chat/rooms", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rooms = await storage.getChatRooms(userId);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  app.get("/api/chat/rooms/:id", isAuthenticated, async (req: any, res) => {
    try {
      const room = await storage.getChatRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Chat room not found" });
      }
      res.json(room);
    } catch (error) {
      console.error("Error fetching chat room:", error);
      res.status(500).json({ message: "Failed to fetch chat room" });
    }
  });

  app.get("/api/chat/rooms/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/rooms/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const message = await storage.createMessage({
        roomId: req.params.id,
        senderId: userId,
        content: req.body.content,
        messageType: "text",
      });
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Helper function to enrich posts with author and like status
  async function enrichPosts(posts: any[], userId?: string) {
    return Promise.all(
      posts.map(async (post) => {
        const author = await storage.getProfile(post.authorId);
        const isLikedByMe = userId ? await storage.hasUserLiked(post.id, userId) : false;
        return { ...post, author, isLikedByMe };
      })
    );
  }

  // Community routes - specific routes must come before :id routes
  app.get("/api/community/recommended", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const posts = await storage.getCommunityPosts();
      const enrichedPosts = await enrichPosts(posts, userId);
      res.json(enrichedPosts);
    } catch (error) {
      console.error("Error fetching recommended posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/community/popular", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const posts = await storage.getCommunityPosts();
      // Sort by likes count for popular
      const sortedPosts = posts.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      const enrichedPosts = await enrichPosts(sortedPosts, userId);
      res.json(enrichedPosts);
    } catch (error) {
      console.error("Error fetching popular posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/community/following", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friends = await storage.getFriends(userId);
      const friendIds = friends.map(f => f.friendId);
      
      const posts = await storage.getCommunityPosts();
      const followingPosts = posts.filter(post => friendIds.includes(post.authorId));
      
      const enrichedPosts = await enrichPosts(followingPosts, userId);
      res.json(enrichedPosts);
    } catch (error) {
      console.error("Error fetching following posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/community", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const posts = await storage.getCommunityPosts(type);
      
      // Enrich posts with author info
      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          const author = await storage.getProfile(post.authorId);
          return { ...post, author };
        })
      );
      
      res.json(enrichedPosts);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post("/api/community", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const post = await storage.createCommunityPost({ ...req.body, authorId: userId });
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post("/api/community/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const liked = await storage.toggleLike(req.params.id, userId);
      res.json({ liked });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.get("/api/community/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getComments(req.params.id);
      // Enrich comments with author info
      const enrichedComments = await Promise.all(
        comments.map(async (comment) => {
          const author = await storage.getProfile(comment.authorId);
          return { ...comment, author };
        })
      );
      res.json(enrichedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/community/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const comment = await storage.createComment({
        postId: req.params.id,
        authorId: userId,
        content: req.body.content,
        parentId: req.body.parentId,
      });
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Bookmark routes
  app.get("/api/bookmarks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemType = req.query.type as string | undefined;
      const bookmarks = await storage.getBookmarks(userId, itemType);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  app.post("/api/bookmarks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { itemType, itemId } = req.body;
      const isBookmarked = await storage.toggleBookmark(userId, itemType, itemId);
      res.json({ isBookmarked });
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      res.status(500).json({ message: "Failed to toggle bookmark" });
    }
  });

  app.get("/api/bookmarks/check", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { itemType, itemId } = req.query;
      const isBookmarked = await storage.hasUserBookmarked(userId, itemType as string, itemId as string);
      res.json({ isBookmarked });
    } catch (error) {
      console.error("Error checking bookmark:", error);
      res.status(500).json({ message: "Failed to check bookmark" });
    }
  });

  // Friends routes
  app.get("/api/friends", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friendsList = await storage.getFriends(userId);
      
      const enrichedFriends = await Promise.all(
        friendsList.map(async (friend) => {
          const friendUserId = friend.userId === userId ? friend.friendId : friend.userId;
          const profile = await storage.getProfile(friendUserId);
          return { ...friend, profile };
        })
      );
      
      res.json(enrichedFriends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.get("/api/friends/requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getFriendRequests(userId);
      
      const enrichedRequests = await Promise.all(
        requests.map(async (request) => {
          const profile = await storage.getProfile(request.userId);
          return { ...request, profile };
        })
      );
      
      res.json(enrichedRequests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });

  app.get("/api/friends/status/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const friendship = await storage.getFriendship(currentUserId, req.params.userId);
      res.json({ friendship });
    } catch (error) {
      console.error("Error checking friendship:", error);
      res.status(500).json({ message: "Failed to check friendship" });
    }
  });

  app.post("/api/friends", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const existing = await storage.getFriendship(userId, req.body.friendId);
      if (existing) {
        return res.status(400).json({ message: "Friend request already exists" });
      }
      
      const friend = await storage.createFriendRequest({
        userId,
        friendId: req.body.friendId,
      });
      
      // Create notification for friend request
      const senderProfile = await storage.getProfile(userId);
      await storage.createNotification({
        userId: req.body.friendId,
        type: "friend_request",
        title: "새로운 친구 요청",
        message: `${senderProfile?.nickname || "누군가"}님이 친구 요청을 보냈습니다.`,
        relatedId: friend.id,
        relatedType: "friend",
      });
      
      res.json(friend);
    } catch (error) {
      console.error("Error creating friend request:", error);
      res.status(500).json({ message: "Failed to create friend request" });
    }
  });

  app.patch("/api/friends/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updated = await storage.updateFriendStatus(req.params.id, req.body.status);
      if (!updated) {
        return res.status(404).json({ message: "Friend request not found" });
      }
      
      // Create notification when friend request is accepted
      if (req.body.status === "accepted") {
        const accepterProfile = await storage.getProfile(userId);
        await storage.createNotification({
          userId: updated.userId,
          type: "friend_accepted",
          title: "친구 요청 수락됨",
          message: `${accepterProfile?.nickname || "누군가"}님이 친구 요청을 수락했습니다.`,
          relatedId: updated.id,
          relatedType: "friend",
        });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating friend status:", error);
      res.status(500).json({ message: "Failed to update friend status" });
    }
  });

  app.delete("/api/friends/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteFriend(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting friend:", error);
      res.status(500).json({ message: "Failed to delete friend" });
    }
  });

  // Direct chat route
  app.post("/api/chat/direct", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const room = await storage.getOrCreateDirectChat(userId, req.body.userId);
      res.json(room);
    } catch (error) {
      console.error("Error creating direct chat:", error);
      res.status(500).json({ message: "Failed to create direct chat" });
    }
  });

  // Notifications routes
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notificationsList = await storage.getNotifications(userId);
      res.json(notificationsList);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notificationsList = await storage.getNotifications(userId);
      const notification = notificationsList.find(n => n.id === req.params.id);
      
      if (!notification) {
        return res.status(403).json({ message: "Notification not found or access denied" });
      }
      
      const updated = await storage.markNotificationAsRead(req.params.id);
      res.json(updated);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/read-all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  return httpServer;
}
