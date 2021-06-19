import {
  DocumentDefinition,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";
import Post, { PostDocument } from "../model/post.model";
import User, { UserDocument } from "../model/user.model";
import { findUser } from "../service/user.service";
import { get } from "lodash";
import Comment from "../model/comment.model";
import _ from "lodash";

export function createPost(input: DocumentDefinition<PostDocument>) {
  return Post.create(input);
}

export function findPost(
  query: FilterQuery<PostDocument>,
  options: QueryOptions = { lean: true }
) {
  return Post.findOne(query, {}, options);
}
export async function getManyPost(query: object) {
  const per_page = parseInt(get(query, "per_page")) || 10;
  const page = parseInt(get(query, "page")) || 1;
  const sort_by = get(query, "sort_by") || "-createdAt";
  const search = get(query, "search") || "";
  let sortMethod;
  let result;
  switch (sort_by) {
    case "-createdAt":
      sortMethod = { createdAt: -1 };
      break;
    case "+createdAt":
      sortMethod = { createdAt: 1 };
      break;
    case "-comments":
      sortMethod = { "comments.counts": -1 };
      break;
    case "+comments":
      sortMethod = { "comments.counts": 1 };
      break;
    case "-likes":
      sortMethod = { likes: -1 };
      break;
    case "+likes":
      sortMethod = { likes: 1 };
      break;
    default:
      break;
  }
  try {
    if (search == "") {
      const posts = await Post.find({},{"comments":0})
        .limit(per_page)
        .skip(per_page * (page - 1))
        .sort(sortMethod);
      const count = await Post.countDocuments();
      const last_page = Math.ceil(count / per_page);
      return { count, last_page, posts };
    } else {
      const posts = await Post.find({ $text: { $search: search } },{"comments":0})
        .limit(per_page)
        .skip(per_page * (page - 1))
        .sort(sortMethod);
      const x = await Post.find({ $text: { $search: search } });
      const count = x.length;
      const last_page = Math.ceil(count / per_page);
      return { count, last_page, posts };
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getMyPost(query: object, userId: object) {
  const per_page = parseInt(get(query, "per_page")) || 10;
  const page = parseInt(get(query, "page")) || 1;
  const sort_by = get(query, "sort_by") || "-createdAt";
  let sortMethod;
  let result;
  switch (sort_by) {
    case "-createdAt":
      sortMethod = { createdAt: -1 };
      break;
    case "+createdAt":
      sortMethod = { createdAt: 1 };
      break;
    case "-comments":
      sortMethod = { "comments.counts": -1 };
      break;
    case "+comments":
      sortMethod = { "comments.counts": 1 };
      break;
    case "-likes":
      sortMethod = { likes: -1 };
      break;
    case "+likes":
      sortMethod = { likes: 1 };
      break;
    default:
      break;
  }
  try {
    const posts = await Post.find({ user: userId },{"comments":0})
      .limit(per_page)
      .skip(per_page * (page - 1))
      .sort(sortMethod);
    const x = await Post.find({ user: userId });
    const count = x.length;
    const last_page = Math.ceil(count / per_page);
    return { count, last_page, posts };
  } catch (error) {
    console.log(error);
  }
}

export function findAndUpdate(
  query: FilterQuery<PostDocument>,
  update: UpdateQuery<PostDocument>,
  options: QueryOptions
) {
  return Post.findOneAndUpdate(query, update, options);
}

export function deletePost(query: FilterQuery<PostDocument>) {
  return Post.deleteOne(query);
}
// export async function validateData(posts: Array<any>) {
//   let tempPosts = posts;
//   for(var j = 0;j<tempPosts.length;j++){
//     const data = tempPosts[j].comments.data;
//     for (var i = 0; i < data.length; i++) {
//       const a = await findUser({ _id: data[i].user });
//       // console.log(a);
//       data[i].userInfo = a;
//     }
//   }
//   return tempPosts
  
// }
