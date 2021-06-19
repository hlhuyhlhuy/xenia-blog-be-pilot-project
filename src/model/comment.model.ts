import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { UserDocument } from "./user.model";
import { PostDocument } from "./post.model";

export interface CommentDocument extends mongoose.Document {
  user: UserDocument["_id"];
  post: string;
  username: string;
  email: string;
  avatar: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new mongoose.Schema(
  {
    commentId: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(10),
    },
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    post: { type: String, default: true },
    username: { type: String, default: true },
    body: { type: String, default: true },
    email: { type: String, default: true },
    avatar: { type: String, default: true },
  },
  { timestamps: true }
);

const Comment = mongoose.model<CommentDocument>("Comment", CommentSchema);

export default Comment;
