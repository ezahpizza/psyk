import { Schema, model, models } from "mongoose";

import { connectMongo } from "./mongodb";

import type { Message } from "ai";


export interface IUser { email: string; password?: string; createdAt: Date; updatedAt: Date }
const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String },
}, { timestamps: true });

export interface IChatHistory { id: string; userId?: string; anonId?: string; messages: Message[]; createdAt: Date; updatedAt: Date }
const ChatHistorySchema = new Schema<IChatHistory>({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, index: true },
  anonId: { type: String, index: true },
  messages: { type: Array, default: [] },
}, { timestamps: true });

export const UserModel = models.User || model<IUser>("User", UserSchema);
export const ChatHistoryModel = models.ChatHistory || model<IChatHistory>("ChatHistory", ChatHistorySchema);

export async function getUser(email: string) { await connectMongo(); return UserModel.find({ email }).lean(); }
export async function createUser(email: string, password: string) { await connectMongo(); return UserModel.create({ email, password }); }
export async function saveChat({ id, messages, userId, anonId }: { id: string; messages: any; userId?: string; anonId?: string }) { await connectMongo(); return ChatHistoryModel.findOneAndUpdate({ id }, { messages, ...(userId?{userId}:{}) , ...(anonId?{anonId}:{}) }, { upsert: true, new: true }); }
export async function getChatById(id: string) { await connectMongo(); return ChatHistoryModel.findOne({ id }).lean(); }
export async function deleteChatById(id: string, owner: { userId?: string; anonId?: string }) { await connectMongo(); return ChatHistoryModel.deleteOne({ id, ...owner }); }
export async function getChatsByUserId(userId: string) { await connectMongo(); return ChatHistoryModel.find({ userId }).sort({ createdAt: -1 }).lean(); }
export async function getChatsByAnonId(anonId: string) { await connectMongo(); return ChatHistoryModel.find({ anonId }).sort({ createdAt: -1 }).lean(); }
