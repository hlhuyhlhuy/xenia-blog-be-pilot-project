import { object, string, ref } from "yup";
const payload = {
  body: object({
    name: string().required("Name is required"),
  }),
};
const params = {
  params: object({
    postId: string().required("postId is required"),
  }),
};

export const createLikeSchema = object({
  ...params,
  ...payload,
});
