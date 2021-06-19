import { Request, Response } from "express";
import { get, omit } from "lodash";
import log from "../logger";
import {
  findPost,
  createPost,
  deletePost,
  findAndUpdate,
  getManyPost,
  getMyPost,
} from "../service/post.service";
import { findUser } from "../service/user.service";

export async function createPostHandler(req: Request, res: Response) {
  const userId = get(req, "user._id");
  const userRole = get(req, "user.role");

  //Check role
  if (userRole != "admin") {
    return res.status(401).send("Authorization Required"); //role is not admin
    log.error("Authorization Required");
  }
  const body = req.body;

  const post = await createPost({ ...body, user: userId });

  return res.send(post);
}

export async function updatePostHandler(req: Request, res: Response) {
  const userId = get(req, "user._id");
  const postId = get(req, "params.postId");
  const userRole = get(req, "user.role");
  const update = req.body;

  //Check role
  if (userRole != "admin") {
    return res.status(401).send("Authorization Required"); //role is not admin
  }

  const post = await findPost({ postId });

  if (!post) {
    return res.sendStatus(404);
  }

  if (String(post.user) != userId) {
    return res.sendStatus(401);
  }

  const updatePost = await findAndUpdate({ postId }, update, { new: true });

  return res.send(updatePost);
}

export async function getPostHandler(req: Request, res: Response) {
  const postId = get(req, "params.postId");
  const post = await findPost({ postId });

  if (!post) {
    return res.sendStatus(404);
  }
  // if (post) {
  //   const counts = get(post, "comments.counts");
  //   const data = get(post, "comments.data");
  //   let userIdArray: Array<any> = [];
  //   let userInfoArray: Array<any> = [];
  //   for (var i = 0; i < data.length; i++) {
  //     if (userIdArray.includes(data[i].user)) {
  //       const index = userIdArray.findIndex(data[i].user);
  //       data[i].userInfo = omit(userInfoArray[index], "password");
  //     } else {
  //       userIdArray.push(data[i].user);
  //       const userInfo = await findUser({ _id: data[i].user });
  //       userInfoArray.push(userInfo);
  //       data[i].userInfo = omit(userInfo, "password");
  //     }
  //   }
  //   post.comments = { counts: counts, data: data };
  // }

  return res.send(omit(post,"comments"));
}
export async function getManyPostHandler(req: Request, res: Response) {
  // const page = get(req, "query.page");
  // const pageNumber = parseInt(page);
  const query = req.query;
  const list = await getManyPost(query);
  return res.send(list);
  // return res.send(result)
}
export async function getMyPostHandler(req: Request, res: Response) {
  const query = req.query;
  const userId = get(req, "user._id");
  const list = await getMyPost(query, userId);
  return res.send(list);
}
export async function deletePostHandler(req: Request, res: Response) {
  const userId = get(req, "user._id");
  const postId = get(req, "params.postId");
  const userRole = get(req, "user.role");

  //Check role
  if (userRole != "admin") {
    return res.status(401).send("Authorization Required"); //role is not admin
  }

  const post = await findPost({ postId });

  if (!post) {
    return res.sendStatus(404);
  }
  if (String(post.user) != String(userId)) {
    return res.sendStatus(401);
  }

  await deletePost({ postId });

  return res.sendStatus(200);
}
