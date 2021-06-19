import { get } from "lodash";
import { Request, Response, NextFunction } from "express";

const requiresUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = get(req, "user");

  if (!user) {
    console.log("dday");
    
    return res.sendStatus(403);
  }

  return next();
};

export default requiresUser;