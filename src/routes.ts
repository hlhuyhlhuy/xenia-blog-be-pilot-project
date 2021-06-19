import { Express, Request, Response } from "express";
import {
  creatUserHandler,
  getCurrentUserHandler,
  updateUserHandler,
  updatePasswordHandler,
  changeAvatarHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  activeUserHandler,
} from "./controller/user.controller";
import {
  createUserSessionHandler,
  invalidateUserSessionHandler,
  getUserSessionHandler,
} from "./controller/session.controller";
import { validateRequest, requiresUser } from "./middleware";
import {
  createUserSchema,
  createUserSessionSchema,
  updateUserSchema,
  updatePasswordSchema,
} from "./schema/user.schema";
import {
  createPostSchema,
  updatePostSchema,
  deletePostSchema,
} from "./schema/post.schema";
import { createCommentSchema } from "./schema/comment.schema";
import { createCommentHandler,getCommentsHandler } from "./controller/comment.controller";
import {
  createPostHandler,
  getPostHandler,
  getManyPostHandler,
  updatePostHandler,
  deletePostHandler,
  getMyPostHandler,
} from "./controller/post.controller";
import { createLikeHandler } from "./controller/like.controller";
import { changeAvatarSchema } from "./schema/avatar.schema";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./schema/password.schema";
import { getNotificationHandler ,setViewedNotificationHandler,readAllNotificationHandler} from "./controller/notification.controller";
export default function (app: Express) {
  app.get("/", (req: Request, res: Response) => {
    res.sendFile("index.html");
  });
  app.get("/healthCheck", (req: Request, res: Response) => {
    res.sendStatus(200);
  });

  //Register user  POST /api/user
  app.post("/api/users", validateRequest(createUserSchema), creatUserHandler);

  //Get current User GET /api/users
  app.get("/api/users", requiresUser, getCurrentUserHandler);

  //Update current user information
  app.put(
    "/api/users/:name",
    [requiresUser, validateRequest(updateUserSchema)],
    updateUserHandler
  );
  //Change Avatar
  app.put(
    "/api/avatar/:name",
    [requiresUser, validateRequest(changeAvatarSchema)],
    changeAvatarHandler
  );

  //Change password
  app.put(
    "/api/password/:name",
    [requiresUser, validateRequest(updatePasswordSchema)],
    updatePasswordHandler
  );

  //Login POST /api/sessions
  app.post(
    "/api/sessions",
    validateRequest(createUserSessionSchema),
    createUserSessionHandler
  );
  //Get the user's session GET   /api/sessions
  app.get("/api/sessions", requiresUser, getUserSessionHandler);

  //Logout DELETE /api/sessions
  app.delete("/api/sessions", requiresUser, invalidateUserSessionHandler);

  //Create a post
  app.post(
    "/api/posts",
    [requiresUser, validateRequest(createPostSchema)],
    createPostHandler
  );

  //Update a post
  app.put(
    "/api/posts/:postId",
    [requiresUser, validateRequest(updatePostSchema)],
    updatePostHandler
  );
  //Get a post
  app.get("/api/posts/:postId", getPostHandler);

  //Get many post
  app.get("/api/posts", getManyPostHandler);

  //Get my post
  app.get("/api/mypost", requiresUser, getMyPostHandler);

  //Delete a post
  app.delete(
    "/api/posts/:postId",
    [requiresUser, validateRequest(deletePostSchema)],
    deletePostHandler
  );

  // Create a Comment in a post
  app.post(
    "/api/posts/:postId",
    [requiresUser, validateRequest(createCommentSchema)],
    createCommentHandler
  );

  //Like a Post
  app.post("/api/likes/:postId", requiresUser, createLikeHandler);

  //Forgot Password
  app.put(
    "/api/forgot-password",
    validateRequest(forgotPasswordSchema),
    forgotPasswordHandler
  );
  //Reset Password
  app.put(
    "/api/reset-password",
    validateRequest(resetPasswordSchema),
    resetPasswordHandler
  );
  //Activate Account
  app.get("/api/active/:activeLink", activeUserHandler);

  //Get Notification
  app.get("/api/notification", requiresUser, getNotificationHandler);

  //Set Viewed Notification
  app.post("/api/notification/:notificationId",requiresUser,setViewedNotificationHandler)

  //Read All Notification
  app.post("/api/notification",requiresUser,readAllNotificationHandler);
  
  //Get Comment
  app.get("/api/comments/:postId",getCommentsHandler)
}
