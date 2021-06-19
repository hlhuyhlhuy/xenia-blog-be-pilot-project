import { Request, Response } from "express";
import { get ,omit} from "lodash";
import log from "../logger";
import { findAndUpdate, findPost } from "../service/post.service";
import { includes, concat, remove } from "lodash";
import {findUser} from "../service/user.service";

export async function createLikeHandler(req: Request, res: Response) {
  const postId = get(req, "params.postId");
  // const username = get(req, "user.name");
  const email = get(req, "user.email");
  //Find Post
  const post = await findPost({ postId });
  //Check if the post exists or not
  if (!post) {
    return res.sendStatus(404);
  }

  //Check if the user has liked this post?
  const counts = get(post, "likes.counts");
  const data = get(post, "likes.data");
  const hasLiked = includes(data, email);
  //Like
  if (!hasLiked) {
    const update = {
      likes: {
        counts: counts + 1,
        data: concat(data, email),
      },
    };
    const updatePost = await findAndUpdate({ postId }, update, { new: true });
    if (updatePost) {
      const counts = get(updatePost, "comments.counts");
      const data = get(updatePost, "comments.data");
      for (var i = 0; i < data.length; i++) {
        const userInfo = await findUser({ _id: data[i].user });
        data[i].userInfo = omit(userInfo, [
          "password",
          "createdAt",
          "updatedAt",
          "role",
          "__v",
          "isActive",
        ]);
        delete data[i].username;
        delete data[i].__v;
      }
      updatePost.comments = { counts: counts, data: data };
    }
    return res.send(updatePost);
  } else {
    //Unlike
    const update = {
      likes: {
        counts: counts - 1,
        data: remove(data, function (user) {
          return user != email;
        }),
      },
    };
    const updatePost = await findAndUpdate({ postId }, update, { new: true });
    if (updatePost) {
      const counts = get(updatePost, "comments.counts");
      const data = get(updatePost, "comments.data");
      for (var i = 0; i < data.length; i++) {
        const userInfo = await findUser({ _id: data[i].user });
        data[i].userInfo = omit(userInfo, [
          "password",
          "createdAt",
          "updatedAt",
          "role",
          "__v",
          "isActive",
        ]);
        delete data[i].username;
        delete data[i].__v;
      }
      updatePost.comments = { counts: counts, data: data };
    }
    return res.send(updatePost);
  }
}
