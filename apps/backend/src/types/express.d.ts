import { User } from "src/user/user.entity";

declare global {
  namespace Express {
    interface Request {
      user?: User | null;
    }
  }
}
