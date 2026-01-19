import { 
  profiles, type Profile, type InsertProfile,
  activities, type Activity, type InsertActivity,
  activityParticipants, type ActivityParticipant, type InsertParticipant,
  chatRooms, type ChatRoom, type InsertChatRoom,
  messages, type Message, type InsertMessage,
  communityPosts, type CommunityPost, type InsertCommunityPost,
  postComments, type PostComment, type InsertComment,
  postLikes, type PostLike, type InsertLike,
  bookmarks, type Bookmark, type InsertBookmark,
  friends, type Friend, type InsertFriend,
  notifications, type Notification, type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // Profiles
  getProfile(userId: string): Promise<Profile | undefined>;
  getProfileById(id: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile | undefined>;
  
  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  getActivity(id: string): Promise<Activity | undefined>;
  getActivitiesByUser(userId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: string, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: string): Promise<void>;
  
  // Participants
  getParticipants(activityId: string): Promise<ActivityParticipant[]>;
  getParticipant(activityId: string, userId: string): Promise<ActivityParticipant | undefined>;
  getParticipantById(id: string): Promise<ActivityParticipant | undefined>;
  createParticipant(participant: InsertParticipant): Promise<ActivityParticipant>;
  updateParticipantStatus(id: string, status: string): Promise<ActivityParticipant | undefined>;
  
  // Chat
  getChatRooms(userId: string): Promise<ChatRoom[]>;
  getChatRoom(id: string): Promise<ChatRoom | undefined>;
  getChatRoomByActivityId(activityId: string): Promise<ChatRoom | undefined>;
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;
  addParticipantToChatRoom(roomId: string, userId: string): Promise<ChatRoom | undefined>;
  getMessages(roomId: string, limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Community
  getCommunityPosts(type?: string, limit?: number): Promise<CommunityPost[]>;
  getCommunityPost(id: string): Promise<CommunityPost | undefined>;
  getPostsByUser(userId: string): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  deleteCommunityPost(id: string): Promise<void>;
  
  // Likes and Comments
  toggleLike(postId: string, userId: string): Promise<boolean>;
  hasUserLiked(postId: string, userId: string): Promise<boolean>;
  getComments(postId: string): Promise<PostComment[]>;
  createComment(comment: InsertComment): Promise<PostComment>;
  
  // Bookmarks
  getBookmarks(userId: string, itemType?: string): Promise<Bookmark[]>;
  toggleBookmark(userId: string, itemType: string, itemId: string): Promise<boolean>;
  hasUserBookmarked(userId: string, itemType: string, itemId: string): Promise<boolean>;
  
  // Friends
  getFriends(userId: string): Promise<Friend[]>;
  getFriendRequests(userId: string): Promise<Friend[]>;
  getFriendship(userId: string, friendId: string): Promise<Friend | undefined>;
  createFriendRequest(friend: InsertFriend): Promise<Friend>;
  updateFriendStatus(id: string, status: string): Promise<Friend | undefined>;
  deleteFriend(id: string): Promise<void>;
  
  // Direct chat
  getOrCreateDirectChat(userId1: string, userId2: string): Promise<ChatRoom>;
  
  // Notifications
  getNotifications(userId: string, limit?: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Profiles
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async getProfileById(id: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const completeness = this.calculateProfileCompleteness(profile);
    const [created] = await db.insert(profiles).values({ 
      ...profile, 
      profileCompleteness: completeness 
    }).returning();
    return created;
  }

  async updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile | undefined> {
    const existing = await this.getProfile(userId);
    if (!existing) return undefined;
    
    const merged = { ...existing, ...profile };
    const completeness = this.calculateProfileCompleteness(merged);
    
    const [updated] = await db.update(profiles)
      .set({ ...profile, profileCompleteness: completeness, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return updated;
  }

  private calculateProfileCompleteness(profile: Partial<Profile>): number {
    let score = 0;
    if (profile.nickname) score += 15;
    if (profile.birthYear) score += 10;
    if (profile.gender) score += 10;
    if (profile.region) score += 10;
    if (profile.bio) score += 15;
    if (profile.profileImages && profile.profileImages.length > 0) score += 15;
    if (profile.interests && profile.interests.length > 0) score += 15;
    if (profile.activityStyles && profile.activityStyles.length > 0) score += 10;
    return Math.min(score, 100);
  }

  // Activities
  async getActivities(limit = 50): Promise<Activity[]> {
    return db.select().from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getActivity(id: string): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }

  async getActivitiesByUser(userId: string): Promise<Activity[]> {
    return db.select().from(activities)
      .where(eq(activities.authorId, userId))
      .orderBy(desc(activities.createdAt));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [created] = await db.insert(activities).values({
      ...activity,
      currentParticipants: 1,
      status: "모집중",
    }).returning();
    return created;
  }

  async updateActivity(id: string, activity: Partial<InsertActivity>): Promise<Activity | undefined> {
    const [updated] = await db.update(activities)
      .set({ ...activity, updatedAt: new Date() })
      .where(eq(activities.id, id))
      .returning();
    return updated;
  }

  async deleteActivity(id: string): Promise<void> {
    await db.delete(activities).where(eq(activities.id, id));
  }

  // Participants
  async getParticipants(activityId: string): Promise<ActivityParticipant[]> {
    return db.select().from(activityParticipants)
      .where(eq(activityParticipants.activityId, activityId));
  }

  async getParticipant(activityId: string, userId: string): Promise<ActivityParticipant | undefined> {
    const [participant] = await db.select().from(activityParticipants)
      .where(and(
        eq(activityParticipants.activityId, activityId),
        eq(activityParticipants.userId, userId)
      ));
    return participant;
  }

  async getParticipantById(id: string): Promise<ActivityParticipant | undefined> {
    const [participant] = await db.select().from(activityParticipants)
      .where(eq(activityParticipants.id, id));
    return participant;
  }

  async createParticipant(participant: InsertParticipant): Promise<ActivityParticipant> {
    const [created] = await db.insert(activityParticipants).values({
      ...participant,
      status: "pending",
    }).returning();
    return created;
  }

  async updateParticipantStatus(id: string, status: string): Promise<ActivityParticipant | undefined> {
    const [updated] = await db.update(activityParticipants)
      .set({ status, respondedAt: new Date() })
      .where(eq(activityParticipants.id, id))
      .returning();
    
    if (updated && status === "accepted") {
      await db.update(activities)
        .set({ currentParticipants: sql`${activities.currentParticipants} + 1` })
        .where(eq(activities.id, updated.activityId));
    }
    
    return updated;
  }

  // Chat
  async getChatRooms(userId: string): Promise<ChatRoom[]> {
    return db.select().from(chatRooms)
      .where(sql`${chatRooms.participants} @> ARRAY[${userId}]::text[]`)
      .orderBy(desc(chatRooms.updatedAt));
  }

  async getChatRoom(id: string): Promise<ChatRoom | undefined> {
    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, id));
    return room;
  }

  async getChatRoomByActivityId(activityId: string): Promise<ChatRoom | undefined> {
    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.activityId, activityId));
    return room;
  }

  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const [created] = await db.insert(chatRooms).values(room).returning();
    return created;
  }

  async addParticipantToChatRoom(roomId: string, userId: string): Promise<ChatRoom | undefined> {
    const room = await this.getChatRoom(roomId);
    if (!room) return undefined;
    
    const currentParticipants = room.participants || [];
    if (!currentParticipants.includes(userId)) {
      const [updated] = await db.update(chatRooms)
        .set({ 
          participants: [...currentParticipants, userId],
          updatedAt: new Date() 
        })
        .where(eq(chatRooms.id, roomId))
        .returning();
      return updated;
    }
    return room;
  }

  async getMessages(roomId: string, limit = 100): Promise<Message[]> {
    return db.select().from(messages)
      .where(eq(messages.roomId, roomId))
      .orderBy(messages.createdAt)
      .limit(limit);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    
    await db.update(chatRooms)
      .set({ updatedAt: new Date() })
      .where(eq(chatRooms.id, message.roomId));
    
    return created;
  }

  // Community
  async getCommunityPosts(type?: string, limit = 50): Promise<CommunityPost[]> {
    if (type) {
      return db.select().from(communityPosts)
        .where(eq(communityPosts.postType, type))
        .orderBy(desc(communityPosts.createdAt))
        .limit(limit);
    }
    return db.select().from(communityPosts)
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit);
  }

  async getCommunityPost(id: string): Promise<CommunityPost | undefined> {
    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, id));
    return post;
  }

  async getPostsByUser(userId: string): Promise<CommunityPost[]> {
    return db.select().from(communityPosts)
      .where(eq(communityPosts.authorId, userId))
      .orderBy(desc(communityPosts.createdAt));
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [created] = await db.insert(communityPosts).values(post).returning();
    return created;
  }

  async deleteCommunityPost(id: string): Promise<void> {
    await db.delete(communityPosts).where(eq(communityPosts.id, id));
  }

  // Likes
  async toggleLike(postId: string, userId: string): Promise<boolean> {
    const [existing] = await db.select().from(postLikes)
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.userId, userId)
      ));
    
    if (existing) {
      await db.delete(postLikes).where(eq(postLikes.id, existing.id));
      await db.update(communityPosts)
        .set({ likesCount: sql`${communityPosts.likesCount} - 1` })
        .where(eq(communityPosts.id, postId));
      return false;
    } else {
      await db.insert(postLikes).values({ postId, userId });
      await db.update(communityPosts)
        .set({ likesCount: sql`${communityPosts.likesCount} + 1` })
        .where(eq(communityPosts.id, postId));
      return true;
    }
  }

  async hasUserLiked(postId: string, userId: string): Promise<boolean> {
    const [existing] = await db.select().from(postLikes)
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.userId, userId)
      ));
    return !!existing;
  }

  // Comments
  async getComments(postId: string): Promise<PostComment[]> {
    return db.select().from(postComments)
      .where(eq(postComments.postId, postId))
      .orderBy(postComments.createdAt);
  }

  async createComment(comment: InsertComment): Promise<PostComment> {
    const [created] = await db.insert(postComments).values(comment).returning();
    
    await db.update(communityPosts)
      .set({ commentsCount: sql`${communityPosts.commentsCount} + 1` })
      .where(eq(communityPosts.id, comment.postId));
    
    return created;
  }

  // Bookmarks
  async getBookmarks(userId: string, itemType?: string): Promise<Bookmark[]> {
    if (itemType) {
      return db.select().from(bookmarks)
        .where(and(eq(bookmarks.userId, userId), eq(bookmarks.itemType, itemType)))
        .orderBy(desc(bookmarks.createdAt));
    }
    return db.select().from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));
  }

  async toggleBookmark(userId: string, itemType: string, itemId: string): Promise<boolean> {
    const [existing] = await db.select().from(bookmarks)
      .where(and(
        eq(bookmarks.userId, userId),
        eq(bookmarks.itemType, itemType),
        eq(bookmarks.itemId, itemId)
      ));
    
    if (existing) {
      await db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
      return false;
    } else {
      await db.insert(bookmarks).values({ userId, itemType, itemId });
      return true;
    }
  }

  async hasUserBookmarked(userId: string, itemType: string, itemId: string): Promise<boolean> {
    const [existing] = await db.select().from(bookmarks)
      .where(and(
        eq(bookmarks.userId, userId),
        eq(bookmarks.itemType, itemType),
        eq(bookmarks.itemId, itemId)
      ));
    return !!existing;
  }

  // Friends
  async getFriends(userId: string): Promise<Friend[]> {
    return db.select().from(friends)
      .where(or(
        eq(friends.userId, userId),
        eq(friends.friendId, userId)
      ));
  }

  async createFriendRequest(friend: InsertFriend): Promise<Friend> {
    const [created] = await db.insert(friends).values({
      ...friend,
      status: "pending",
    }).returning();
    return created;
  }

  async updateFriendStatus(id: string, status: string): Promise<Friend | undefined> {
    const [updated] = await db.update(friends)
      .set({ status })
      .where(eq(friends.id, id))
      .returning();
    return updated;
  }

  async getFriendRequests(userId: string): Promise<Friend[]> {
    return db.select().from(friends)
      .where(and(
        eq(friends.friendId, userId),
        eq(friends.status, "pending")
      ));
  }

  async getFriendship(userId: string, friendId: string): Promise<Friend | undefined> {
    const [existing] = await db.select().from(friends)
      .where(or(
        and(eq(friends.userId, userId), eq(friends.friendId, friendId)),
        and(eq(friends.userId, friendId), eq(friends.friendId, userId))
      ));
    return existing;
  }

  async deleteFriend(id: string): Promise<void> {
    await db.delete(friends).where(eq(friends.id, id));
  }

  async getOrCreateDirectChat(userId1: string, userId2: string): Promise<ChatRoom> {
    const sortedParticipants = [userId1, userId2].sort();
    
    const existingRooms = await db.select().from(chatRooms)
      .where(and(
        eq(chatRooms.type, "direct"),
        sql`${chatRooms.participants} @> ARRAY[${userId1}, ${userId2}]::text[]`
      ));
    
    const existingRoom = existingRooms.find(room => {
      const participants = room.participants || [];
      return participants.length === 2;
    });
    
    if (existingRoom) {
      return existingRoom;
    }
    
    const [newRoom] = await db.insert(chatRooms).values({
      type: "direct",
      participants: sortedParticipants,
    }).returning();
    
    return newRoom;
  }

  // Notifications
  async getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    return Number(result[0]?.count || 0);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const [updated] = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }
}

export const storage = new DatabaseStorage();
