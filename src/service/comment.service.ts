import {
  DocumentDefinition,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";
import Comment, { CommentDocument } from "../model/comment.model";
import { findUser } from "../service/user.service";
import { get } from "lodash";

export function createComment(input: DocumentDefinition<CommentDocument>) {
  return Comment.create(input);
}
export async function getComments(postId: string) {
  const comments =  Comment.find({ post: postId },{"email":0,"username":0,"avatar":0}).populate('user',["avatar","email","name"]);
  // const newComments = comments
  // for (var i = 0; i < newComments.length; i++) {
  //   const userInfo = await findUser({ _id: newComments[i].user });
  //   newComments[i].user = userInfo;
  // }
  return comments;
}
