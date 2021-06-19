import { object, string, ref } from "yup";
export const forgotPasswordSchema = object({
  body: object({
    email: string()
      .email("Must be a valid email")
      .required("Email is required"),
  }),
});
export const resetPasswordSchema = object({
  body: object({
    resetLink: string().required("resetLink is required"),
    newPassword: string()
      .required("Password is required")
      .min(8, "Password is too short - should be 6 chars minimum")
      .max(20, "Password is too long - should be 20 chars maximum")
      .matches(/^[a-zA-Z0-9_.-]*$/, "Password can only contain Latin letters."),
  }),
});
