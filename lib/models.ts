import { Schema, model, models } from "mongoose";

import { connectMongo } from "./mongodb";

import type { Message } from "ai";


export interface IUser { email: string; password?: string; createdAt: Date; updatedAt: Date }
const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String },
}, { timestamps: true });

export interface IChatHistory { id: string; userId: string; messages: Message[]; createdAt: Date; updatedAt: Date }
export interface IAnonymousChatHistory { id: string; anonId: string; messages: Message[]; createdAt: Date; updatedAt: Date }

// Store raw AI SDK message objects (heterogeneous) using Mixed

const ChatHistorySchema = new Schema<IChatHistory>({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  messages: [{ type: Schema.Types.Mixed }],
}, { timestamps: true });

const AnonymousChatHistorySchema = new Schema<IAnonymousChatHistory>({
  id: { type: String, required: true, unique: true, index: true },
  anonId: { type: String, required: true, index: true },
  messages: [{ type: Schema.Types.Mixed }],
}, { timestamps: true });

export const UserModel = models.User || model<IUser>("User", UserSchema);

export const ChatHistoryModel = models.ChatHistory || model<IChatHistory>("ChatHistory", ChatHistorySchema);

export const AnonymousChatHistoryModel = models.AnonymousChatHistory || model<IAnonymousChatHistory>("AnonymousChatHistory", AnonymousChatHistorySchema);

export type ChatRecord = (IChatHistory | IAnonymousChatHistory) & { _id?: any };

export async function getUser(email: string) { await connectMongo(); return UserModel.find({ email }).lean<IUser[]>(); }

export async function createUser(email: string, password: string) { await connectMongo(); return UserModel.create({ email, password }); }

export async function saveChat({ id, messages, userId, anonId }: { id: string; messages: Message[]; userId?: string; anonId?: string }) {
  await connectMongo();
  if (userId) {
    return ChatHistoryModel.findOneAndUpdate({ id }, { messages, userId }, { upsert: true, new: true }).lean<IChatHistory>();
  }
  if (anonId) {
    return AnonymousChatHistoryModel.findOneAndUpdate({ id }, { messages, anonId }, { upsert: true, new: true }).lean<IAnonymousChatHistory>();
  }
  throw new Error("Either userId or anonId must be provided to saveChat");
}

export async function getChatById(id: string): Promise<ChatRecord | null> {
  await connectMongo();
  const userChat = await ChatHistoryModel.findOne({ id }).lean<IChatHistory | null>();
  if (userChat) return userChat;
  const anonChat = await AnonymousChatHistoryModel.findOne({ id }).lean<IAnonymousChatHistory | null>();
  return anonChat;
}

export async function deleteChatById(id: string, owner: { userId?: string; anonId?: string }) {
  await connectMongo();
  if (owner.userId) return ChatHistoryModel.deleteOne({ id, userId: owner.userId });
  if (owner.anonId) return AnonymousChatHistoryModel.deleteOne({ id, anonId: owner.anonId });
  throw new Error("Owner identifier required");
}

export async function getChatsByUserId(userId: string) { await connectMongo(); return ChatHistoryModel.find({ userId }).sort({ createdAt: -1 }).lean<IChatHistory[]>(); }
export async function getChatsByAnonId(anonId: string) { await connectMongo(); return AnonymousChatHistoryModel.find({ anonId }).sort({ createdAt: -1 }).lean<IAnonymousChatHistory[]>(); }
