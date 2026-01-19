import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// Interest categories for matching
export const INTEREST_CATEGORIES = [
  "공연/전시",
  "걷기/트레킹",
  "스포츠",
  "문화생활",
  "교육/자기계발",
  "봉사활동",
  "여행",
  "맛집",
  "기타취미"
] as const;

export const ACTIVITY_FREQUENCY = ["주 3회 이상", "주 1~2회", "월 3~4회", "월 2회 이하"] as const;
export const PREFERRED_TIME = ["평일 오전", "평일 오후", "평일 저녁", "주말 오전", "주말 오후", "주말 저녁"] as const;
export const GROUP_SIZE = ["2-3명", "4-5명", "6명 이상"] as const;
export const GENDER_PREFERENCE = ["무관", "동성만", "혼성"] as const;
export const ACTIVITY_STYLES = [
  "조용한", "활발한", "진지한", "유머러스한", "계획적인", "즉흥적인"
] as const;

// User Profile - extends auth user with preferences
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  nickname: varchar("nickname", { length: 50 }),
  birthYear: integer("birth_year"),
  gender: varchar("gender", { length: 10 }),
  region: varchar("region", { length: 100 }),
  bio: text("bio"),
  profileImages: text("profile_images").array(),
  interests: text("interests").array(),
  activityFrequency: varchar("activity_frequency", { length: 20 }),
  preferredTime: text("preferred_time").array(),
  preferredGroupSize: varchar("preferred_group_size", { length: 20 }),
  genderPreference: varchar("gender_preference", { length: 20 }),
  activityStyles: text("activity_styles").array(),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  isPhotoVerified: boolean("is_photo_verified").default(false),
  profileCompleteness: integer("profile_completeness").default(0),
  activityCount: integer("activity_count").default(0),
  averageRating: integer("average_rating").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profilesRelations = relations(profiles, ({ many }) => ({
  activities: many(activities),
  participations: many(activityParticipants),
  posts: many(communityPosts),
  sentMessages: many(messages),
}));

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

// Activity Posts (동행 모집글)
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description"),
  activityDate: timestamp("activity_date").notNull(),
  location: varchar("location", { length: 200 }),
  estimatedCost: varchar("estimated_cost", { length: 50 }),
  maxParticipants: integer("max_participants").default(5),
  currentParticipants: integer("current_participants").default(1),
  ageRange: varchar("age_range", { length: 50 }),
  genderRestriction: varchar("gender_restriction", { length: 20 }),
  activityLevel: varchar("activity_level", { length: 20 }),
  images: text("images").array(),
  tags: text("tags").array(),
  status: varchar("status", { length: 20 }).default("모집중"),
  isFriendsOnly: boolean("is_friends_only").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  author: one(profiles, {
    fields: [activities.authorId],
    references: [profiles.userId],
  }),
  participants: many(activityParticipants),
  chatRoom: one(chatRooms),
}));

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  currentParticipants: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Activity Participants (참여자 관리)
export const activityParticipants = pgTable("activity_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  activityId: varchar("activity_id").notNull(),
  userId: varchar("user_id").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  message: text("message"),
  appliedAt: timestamp("applied_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

export const activityParticipantsRelations = relations(activityParticipants, ({ one }) => ({
  activity: one(activities, {
    fields: [activityParticipants.activityId],
    references: [activities.id],
  }),
  user: one(profiles, {
    fields: [activityParticipants.userId],
    references: [profiles.userId],
  }),
}));

export const insertParticipantSchema = createInsertSchema(activityParticipants).omit({
  id: true,
  status: true,
  appliedAt: true,
  respondedAt: true,
});

export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type ActivityParticipant = typeof activityParticipants.$inferSelect;

// Chat Rooms
export const chatRooms = pgTable("chat_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  activityId: varchar("activity_id"),
  type: varchar("type", { length: 20 }).default("group"),
  name: varchar("name", { length: 100 }),
  participants: text("participants").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  activity: one(activities, {
    fields: [chatRooms.activityId],
    references: [activities.id],
  }),
  messages: many(messages),
}));

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;

// Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type", { length: 20 }).default("text"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  room: one(chatRooms, {
    fields: [messages.roomId],
    references: [chatRooms.id],
  }),
  sender: one(profiles, {
    fields: [messages.senderId],
    references: [profiles.userId],
  }),
}));

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Community Posts (피드)
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull(),
  content: text("content"),
  images: text("images").array(),
  activityId: varchar("activity_id"),
  postType: varchar("post_type", { length: 20 }).default("activity"),
  location: varchar("location", { length: 200 }),
  tags: text("tags").array(),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  author: one(profiles, {
    fields: [communityPosts.authorId],
    references: [profiles.userId],
  }),
  activity: one(activities, {
    fields: [communityPosts.activityId],
    references: [activities.id],
  }),
  comments: many(postComments),
  likes: many(postLikes),
}));

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  likesCount: true,
  commentsCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

// Post Comments
export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  authorId: varchar("author_id").notNull(),
  content: text("content").notNull(),
  parentId: varchar("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  post: one(communityPosts, {
    fields: [postComments.postId],
    references: [communityPosts.id],
  }),
  author: one(profiles, {
    fields: [postComments.authorId],
    references: [profiles.userId],
  }),
}));

export const insertCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type PostComment = typeof postComments.$inferSelect;

// Post Likes
export const postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(communityPosts, {
    fields: [postLikes.postId],
    references: [communityPosts.id],
  }),
}));

export const insertLikeSchema = createInsertSchema(postLikes).omit({
  id: true,
  createdAt: true,
});

export type InsertLike = z.infer<typeof insertLikeSchema>;
export type PostLike = typeof postLikes.$inferSelect;

// Bookmarks
export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  itemType: varchar("item_type", { length: 20 }).notNull(), // "post" or "activity"
  itemId: varchar("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(profiles, {
    fields: [bookmarks.userId],
    references: [profiles.userId],
  }),
}));

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
});

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;

// Friends System
export const friends = pgTable("friends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  friendId: varchar("friend_id").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFriendSchema = createInsertSchema(friends).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type InsertFriend = z.infer<typeof insertFriendSchema>;
export type Friend = typeof friends.$inferSelect;

// Notifications System
export const NOTIFICATION_TYPES = [
  "friend_request",
  "friend_accepted",
  "activity_join_request",
  "activity_accepted",
  "activity_rejected",
  "new_message",
  "new_comment",
  "post_like",
] as const;

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message"),
  relatedId: varchar("related_id"),
  relatedType: varchar("related_type", { length: 50 }),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(profiles, {
    fields: [notifications.userId],
    references: [profiles.userId],
  }),
}));

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Phone Verification Codes
export const phoneVerificationCodes = pgTable("phone_verification_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPhoneVerificationCodeSchema = createInsertSchema(phoneVerificationCodes).omit({
  id: true,
  isUsed: true,
  createdAt: true,
});

export type InsertPhoneVerificationCode = z.infer<typeof insertPhoneVerificationCodeSchema>;
export type PhoneVerificationCode = typeof phoneVerificationCodes.$inferSelect;
