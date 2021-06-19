import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { UserDocument } from "./user.model";

export interface PostDocument extends mongoose.Document {
  user: UserDocument["_id"];
  title: string;
  body: string;
  comments: object;
  likes: object;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(10),
    },
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    title: { type: String, default: true },
    comments: { type: Object, default: { counts: 0, data: [] } },
    likes: { type: Object, default: { counts: 0, data: [] } },
    image:{type:String,default: "https://res.cloudinary.com/rhy123/image/upload/v1623858910/LEz5h8B_fc5iez.jpg"},
    body: { type: String, default: true },
  },
  { timestamps: true }
);

PostSchema.index({ "$**": "text" });

const Post = mongoose.model<PostDocument>("Post", PostSchema);

export default Post;
