import {
  DocumentDefinition,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";
import Notification, {
  NotificationDocument,
} from "../model/notification.model";
import { get } from "lodash";

export function createNotification(
  input: DocumentDefinition<NotificationDocument>
) {
  return Notification.create(input);
}
export async function getNotification(query: object, email: string) {
  const per_page = parseInt(get(query, "per_page")) || 10;
  const page = parseInt(get(query, "page")) || 1;
  const sort_by = get(query, "sort_by") || "-createdAt";
  console.log(email);

  let sortMethod;
  switch (sort_by) {
    case "-createdAt":
      sortMethod = { createdAt: -1 };
      break;
    case "+createdAt":
      sortMethod = { createdAt: 1 };
      break;
    default:
      break;
  }
  try {
    const notifications = await Notification.find({ ownerEmail: email })
      .limit(per_page)
      .skip(per_page * (page - 1))
      .sort(sortMethod);
    const listFalse = await Notification.find({
      ownerEmail: email,
      viewed: false,
    });
    const unsold = listFalse.length;
    const x = await Notification.find({ ownerEmail: email });
    const count = x.length;
    const last_page = Math.ceil(count / per_page);
    return { unsold, count, last_page, notifications };
  } catch (error) {
    console.log(error);
  }
}
export async function findNotification(
  query: FilterQuery<NotificationDocument>
) {
  return Notification.findOne(query).lean();
}
export async function findNotificationAndUpdate(
  query: FilterQuery<NotificationDocument>,
  update: UpdateQuery<NotificationDocument>,
  options: QueryOptions
) {
  return Notification.findOneAndUpdate(query, update, options);
}
