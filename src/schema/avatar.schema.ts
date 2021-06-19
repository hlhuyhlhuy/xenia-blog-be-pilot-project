import { object, string, ref } from "yup";
const params = {
  params: object({
    name: string().required("name of user is required"),
  }),
};
const payload = {
  body: object({
    avatar: string().required("Image not found"),
  }),
};
export const changeAvatarSchema = object({
  ...payload,
  ...params,
});
