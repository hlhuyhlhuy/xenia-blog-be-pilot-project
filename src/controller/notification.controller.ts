import { Request, Response } from "express";
import { get, omit } from "lodash";
import Notification from "../model/notification.model";
import {
  findNotification,
  findNotificationAndUpdate,
  getNotification,
} from "../service/notification.service";
import { findUser } from "../service/user.service";

export async function getNotificationHandler(req: Request, res: Response) {
  const query = req.query;
  const email = get(req, "user.email");
  const list = await getNotification(query, email);

  if (!list) {
    return res.sendStatus(404);
  }
  const count = get(list, "count");
  const last_page = get(list, "last_page");
  const notifications = get(list, "notifications");
  const unsold = get(list, "unsold");

  for (var i = 0; i < notifications.length; i++) {
    const userInfo = await findUser({ email: notifications[i].clientEmail });
    const avatar = get(userInfo, "avatar");
    notifications[i].avatar = avatar || notifications[i].avatar;
  }
  const newList = {
    unsold: unsold,
    count: count,
    last_page: last_page,
    notifications: notifications,
  };

  return res.send(newList);
}
export async function setViewedNotificationHandler(
  req: Request,
  res: Response
) {
  const notificationId = get(req, "params.notificationId");
  const userRole = get(req, "user.role");
  const email = get(req, "user.email");
  //Check role
  if (userRole != "admin") {
    return res.status(401).send("Authorization Required"); //role is not admin
  }
  const notification = await findNotification({
    notificationId: notificationId,
  });
  const notificationIdToUpdate = get(notification, "notificationId");

  if (!notification) {
    return res.sendStatus(404);
  }
  if (email != notification.ownerEmail) {
    return res.sendStatus(401);
  }

  const notificationUpdate = await findNotificationAndUpdate(
    { notificationId: notificationIdToUpdate },
    { viewed: true },
    {
      new: true,
    }
  );
  console.log(notificationUpdate);

  if (notificationUpdate) {
    return res.sendStatus(200);
  } else {
    return res.sendStatus(404);
  }
}
export async function readAllNotificationHandler(req: Request, res: Response) {
  const userRole = get(req, "user.role");
  const email = get(req, "user.email");
  //Check role
  if (userRole != "admin") {
    return res.status(401).send("Authorization Required"); //role is not admin
  }

  await Notification.updateMany(
    { ownerEmail: email },
    { viewed: true },
    { new: true }
  );

  return res.sendStatus(200);
}
