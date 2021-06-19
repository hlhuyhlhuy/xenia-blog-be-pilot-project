import { Request, Response } from "express";
import bcrypt from "bcrypt";
import config from "config";
import { omit } from "lodash";
import {
  createUser,
  findUser,
  findUserAndUpdate,
} from "../service/user.service";
import log from "../logger";
import { get } from "lodash";
import User from "../model/user.model";
import { sign, decode } from "../utils/jwt.utils";
const mailjet = require("node-mailjet").connect(
  config.get("MJ_APIKEY_PUBLIC"),
  config.get("MJ_APIKEY_PRIVATE")
);
export async function creatUserHandler(req: Request, res: Response) {
  try {
    const name = get(req, "body.name");
    const tempUser = await findUser({ name });
    if (tempUser) {
      return res.status(409).send("This name is already in use");
    }
    const user = await createUser(req.body);

    const email = get(req, "body.email");
    const token = sign({ email }, { expiresIn: config.get("accessTokenTtl") });

    //Update resetLink
    const userUpdate = await findUserAndUpdate(
      { email },
      { activeLink: token },
      { new: true }
    );
    //Send email resetLink
    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "holehuy2003@gmail.com",
            Name: "TeamDUT",
          },
          To: [
            {
              Email: user.email,
              Name: user.name,
            },
          ],
          Subject: "Active Account Xenia.Blog",
          TextPart: "TeamDUT email",
          HTMLPart: `<h3>Dear ${user.name}, Click on given link to active your account <br />
           <a href='https://app-xenia.herokuapp.com/api/active/${token}'>Active Account Link</a>!</h3><br />From Xenia.Blog with love!`,
          CustomID: "AppGettingStartedTest",
        },
      ],
    });
    request
      .then((result: any) => {
        // console.log(result.body);
        return res.send("Email has been sent, kinly follow the instruction");
      })
      .catch((err: any) => {
        // console.log(err.statusCode);
        return res.status(400).send("Reset password link error");
      });
  } catch (error) {
    log.error(error);
    return res.status(409).send("This email is already in use");
  }
}
// Get Current User
export async function getCurrentUserHandler(req: Request, res: Response) {
  // const username = get(req, "user.name");
  // const role = get(req, "user.role");
  // const email = get(req, "user.email");
  // const avatar = get(req, "user.avatar");
  const email = get(req, "user.email");
  //Find user
  const user = await findUser({ email });
  if (!user) {
    return res.sendStatus(401);
  }

  const role = get(user, "role");
  const username = get(user, "name");
  const avatar = get(user, "avatar");

  return res.send({ username, role, email, avatar });
}

//Update User

export async function updateUserHandler(req: Request, res: Response) {
  const name = get(req, "params.name");
  const update = req.body;

  //Find User
  const user = await findUser({ name });
  if (!user) {
    return res.sendStatus(401);
  }

  const updateUser = await findUserAndUpdate({ name }, update, { new: true });
  return res.send(updateUser);
}
//Change Avatar
export async function changeAvatarHandler(req: Request, res: Response) {
  const name = get(req, "params.name");
  const avatar = req.body;
  //Find User
  const user = await findUser({ name });
  if (!user) {
    return res.sendStatus(401);
  }

  const updateUser = await findUserAndUpdate({ name }, avatar, { new: true });
  return res.send(updateUser);
}

//Change Password
export async function updatePasswordHandler(req: Request, res: Response) {
  const name = get(req, "params.name");
  const password = get(req, "body.password");
  const newPassword = get(req, "body.newPassword");

  //Find User
  const user = await User.findOne({ name });
  if (!user) {
    return res.sendStatus(401);
  }
  //Check if password is not correct
  const isValid = await user.comparePassword(password);
  if (!isValid) {
    return res.status(404).send("Old Password is not correct");
  }

  //Hash newPassword then replace
  const salt = await bcrypt.genSalt(config.get("saltWorkFactor"));

  const hash = bcrypt.hashSync(newPassword, salt);
  const update = {
    password: hash,
  };
  findUserAndUpdate({ name }, update, { new: true });
  return res.status(200).send("Success");
}

export async function forgotPasswordHandler(req: Request, res: Response) {
  const { email } = get(req, "body");
  console.log({ email });
  const user = await findUser({ email });

  if (!user) {
    return res.status(400).send("User with this email does not exists.");
  }
  const token = sign({ email }, { expiresIn: config.get("accessTokenTtl") });
  console.log(token);

  //Update resetLink
  const userUpdate = await findUserAndUpdate(
    { email },
    { resetLink: token },
    { new: true }
  );

  //Send email resetLink
  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "holehuy2003@gmail.com",
          Name: "TeamDUT",
        },
        To: [
          {
            Email: user.email,
            Name: user.name,
          },
        ],
        Subject: "Reset Password Xenia.Blog",
        TextPart: "TeamDUT email",
        HTMLPart: `<h3>Dear ${user.name}, Click on given link to reset your password <br />
           <a href='https://front-end-blogs.vercel.app/resetpassword/${token}'>Reset Password Link</a>!</h3><br />From Xenia.Blog with love!`,
        CustomID: "AppGettingStartedTest",
      },
    ],
  });
  request
    .then((result: any) => {
      // console.log(result.body);
      return res.send("Email has been sent, kinly follow the instruction");
    })
    .catch((err: any) => {
      // console.log(err.statusCode);
      return res.status(400).send("Reset password link error");
    });
}

export async function resetPasswordHandler(req: Request, res: Response) {
  const resetLink = get(req, "body.resetLink");
  const newPassword = get(req, "body.newPassword");

  const { decoded, expired } = decode(resetLink);

  if (expired) {
    return res.status(498).send("Expired");
  }

  const email = get(decoded, "email");

  //Find User
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).send("Invalid Token");
  }
  //Hash newPassword then replace
  const salt = await bcrypt.genSalt(config.get("saltWorkFactor"));

  const hash = bcrypt.hashSync(newPassword, salt);
  const update = {
    password: hash,
    resetLink: "",
  };

  const userUpdate = await findUserAndUpdate({ resetLink }, update, {
    new: true,
  });

  if (userUpdate) {
    return res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
}
export async function activeUserHandler(req: Request, res: Response) {
  const activeLink = get(req, "params.activeLink");

  const { decoded, expired } = decode(activeLink);
  if (expired) {
    return res.status(498).send("Expired");
  }

  const email = get(decoded, "email");

  if (!email) {
    return res.sendStatus(404)
  }
  //Find User
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).send("Invalid Token");
  }
  
  const update = {
    activeLink: "",
    isActive: true,
  };
  const userUpdate = await findUserAndUpdate({ activeLink }, update, {
    new: true,
  });

  if (userUpdate) {
    return res.status(200).redirect("https://front-end-blogs.vercel.app/login");
  } else {
    return res.sendStatus(404);
  }
}
