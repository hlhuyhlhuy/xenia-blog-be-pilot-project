import { object, string, ref } from "yup";

const payload = {
  body: object({
    body: string()
      .required("Content of comment is required")
      .min(1, "Content of comment is required"),
  }),
};
const params = {
  params: object({
    postId: string().required("postId is required"),
  }),
};

export const createCommentSchema = object({
  ...params,
  ...payload,
});
