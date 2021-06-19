import { findUser, validatePassword } from "../service/user.service";
import { Request, Response } from "express";
import { get } from "lodash";
import {
  createSession,
  createAccessToken,
  updateSession,
  findSessions,
} from "../service/session.service";
import config from "config";
import { sign } from "../utils/jwt.utils";
import log from "../logger";

export async function createUserSessionHandler(req: Request, res: Response) {
  //validate the email and password
  const user = await validatePassword(req.body);
  // console.log(user);

  if (!user) {
    return res.status(401).send("Invalid username or password");
  }

  if (user.isActive == false) {
    return res.status(404).send("Account has not been activated");
  }
  //Create a session
  const session = await createSession(user._id, req.get("user-agent") || "");

  //Create access token
  const accessToken = createAccessToken({
    user,
    session,
  });

  //Create refresh token
  const refreshToken = sign(session, {
    expiresIn: config.get("refreshTokenTtl"), //1year
  });

  //Get role
  const role = user.role;
  //Get name
  const name = user.name;
  //get email
  const email = user.email;

  //Send refresh and access token back
  log.info(`User ${user.name} LOGIN SUCCESS with email ${user.email}`);
  return res.send({ accessToken, refreshToken, role, name, email });
}

export async function invalidateUserSessionHandler(
  req: Request,
  res: Response
) {
  const sessionId = get(req, "user.session");
  const userId = get(req, "user._id");
  await updateSession({ _id: sessionId }, { valid: false });
  const user = await findUser({ _id: userId });
  log.info(`User {email:${user?.email},name:${user?.name}} LOGOUT SUCCESS`);
  return res.sendStatus(200);
}

export async function getUserSessionHandler(req: Request, res: Response) {
  const userId = get(req, "user._id");

  const sessions = await findSessions({ user: userId, valid: true });

  return res.send(sessions);
}
