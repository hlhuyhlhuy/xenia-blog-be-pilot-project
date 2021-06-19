import { Request, Response } from "express";
import { findAndUpdate, findPost } from "../service/post.service";
import { createComment,getComments } from "../service/comment.service";
import { findUser } from "../service/user.service";
import { concat, get, omit, random } from "lodash";
import { trigger } from "../utils/pusher.utils";
import { createNotification } from "../service/notification.service";

export async function createCommentHandler(req: Request, res: Response) {
  const userId = get(req, "user._id");
  const username = get(req, "user.name");
  const postId = get(req, "params.postId");
  const email = get(req, "user.email");
  const avatarfake = get(req, "user.avatar");
  const user = await findUser({ email: email });
  const avatar = get(user, "avatar");

  const body = req.body;

  //Find Post
  const post = await findPost({ postId });
  //Check if the post exists or not
  if (!post) {
    return res.sendStatus(404);
  }
  //Create Comment
  const comment = await createComment({
    ...body,
    user: userId,
    post: postId,
    username: username,
  });

  //Trigger notification for comment
  const postOwnerId = get(post, "user");
  const postTitle = get(post, "title");
  const postOwner = await findUser({ _id: postOwnerId });

  const emailOwner = get(postOwner, "email");

  if (email != emailOwner) {
    const noti = await createNotification({
      message: `${username} đã bình luận bài viết của bạn`,
      postTitle: postTitle,
      postId: postId,
      viewed: false,
      ownerEmail: emailOwner ? emailOwner : "",
      clientEmail: email,
      avatar: avatar ? avatar : avatarfake,
      createdAt: comment.createdAt,
      updatedAt: comment.createdAt,
    });
    const notificationId = get(noti, "notificationId");
    trigger(emailOwner, "my-event", {
      message: `${username} đã bình luận bài viết của bạn`,
      postTitle: post.title,
      postId: postId,
      createdAt: comment.createdAt,
      avatar: avatar,
      viewed: false,
      notificationId,
    });
  }
  const counts = get(post, "comments.counts");
  const data = get(post, "comments.data");

  const update = {
    comments: {
      counts: counts + 1,
      data: [...concat(data, comment)],
    },
  };

  const updatePost = await findAndUpdate({ postId }, update, { new: true });
  // if (updatePost) {
  //   const counts = get(updatePost, "comments.counts");
  //   const data = get(updatePost, "comments.data");
  //   for (var i = 0; i < data.length; i++) {
  //     const userInfo = await findUser({ _id: data[i].user });
  //     data[i].userInfo = omit(userInfo, [
  //       "password",
  //       "createdAt",
  //       "updatedAt",
  //       "role",
  //       "__v",
  //       "isActive",
  //     ]);
  //     delete data[i].username;
  //     delete data[i].__v;
  //   }
  //   updatePost.comments = { counts: counts, data: data };
  // }
  const comments = await getComments(postId);
  return res.send(comments);
}
export async function getCommentsHandler(req: Request, res: Response) {
  const postId = get(req, "params.postId");
  const comments = await getComments(postId);
  return res.send(comments);
}
