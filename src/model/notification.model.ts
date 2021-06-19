import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { UserDocument } from "./user.model";
import { PostDocument } from "./post.model";

export interface NotificationDocument extends mongoose.Document {
  message: string;
  postTitle: string;
  postId: string;
  viewed: boolean;
  ownerEmail: string;
  clientEmail: string;
  avatar:string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(10),
    },
    message: { type: String, default: true },
    postTitle: { type: String, default: true },
    postId: { type: String, default: true },
    viewed: { type: Boolean, default: false },
    ownerEmail: { type: String, default: true },
    clientEmail: { type: String, default: true },
    avatar: { type: String, default: true }
  },
  { timestamps: true }
);

const Notification = mongoose.model<NotificationDocument>(
  "Notification",
  NotificationSchema
);
export default Notification;
