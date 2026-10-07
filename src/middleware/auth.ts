import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const authHeader =
    req.headers.authorization || (req.headers.Authorization as string | undefined);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
  const token = authHeader.split(" ")[1] as string;
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "change_me"
    ) as AuthPayload;
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

export const optionalProtect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader =
    req.headers.authorization || (req.headers.Authorization as string | undefined);

  if (!authHeader) {
    next();
    return;
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }

  try {
    const token = authHeader.slice("Bearer ".length);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "change_me"
    ) as AuthPayload;
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

export default protect;
